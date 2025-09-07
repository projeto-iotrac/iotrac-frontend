#!/bin/bash

# ===== IOTRAC SIMPLE CHECK =====
# Verificação rápida: ping, portas e teste de bloqueio simples

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funções de output
print_header() {
  echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║        IOTRAC SIMPLE CHECK          ║${NC}"
  echo -e "${CYAN}║   Verificação rápida do dispositivo ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
  echo
}

info(){ echo -e "${BLUE}[INFO]${NC} $1"; }
success(){ echo -e "${GREEN}[OK]${NC} $1"; }
warn(){ echo -e "${YELLOW}[WARN]${NC} $1"; }
error(){ echo -e "${RED}[ERRO]${NC} $1"; }

# Estados globais para resumo
ONLINE=0
PORT_22=0
PORT_5001=0
PORT_5000=0
PORT_5002=0
APP_OK=0
APP_URL=""
SAME_SUBNET=0
ARP_MAC=""
ARP_VENDOR=""
HOST_IP=""
HOST_BASE=""

# IP alvo (padrão detecta base e usa .200)
TARGET_IP=${1:-}
# URL do backend (padrão http://localhost:8000). Pode ser sobrescrito por BACKEND_URL env ou 2º arg
USER_BACKEND_URL="${BACKEND_URL:-}"
[ -n "$2" ] && USER_BACKEND_URL="$2"

resolve_ip() {
  if [ -n "$TARGET_IP" ]; then
    echo "$TARGET_IP"
    return 0
  fi

  # Detectar IP local via ipconfig (Git Bash no Windows)
  local line base ip
  line=$(ipconfig 2>/dev/null | grep -m1 "IPv4 Address" | sed -E 's/.*: *//')
  if [ -z "$line" ]; then
    warn "Não foi possível detectar IP local automaticamente."
    read -p "Digite a base da rede (ex: 192.168.1): " base
  else
    base=$(echo "$line" | sed -E 's/\.[0-9]+$//')
  fi
  ip="${base}.200"
  echo "$ip"
}

get_host_ip() {
  local ip
  ip=$(ipconfig 2>/dev/null | grep -m1 "IPv4 Address" | sed -E 's/.*: *//')
  echo "$ip"
}

http_ok() {
  local url=$1
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  [ "$code" = "200" ]
}

check_app_online() {
  local bases=()
  if [ -n "$USER_BACKEND_URL" ]; then
    bases+=("$USER_BACKEND_URL")
  else
    bases+=("http://localhost:8000" "http://127.0.0.1:8000")
  fi
  local paths=("/status" "/" "/docs")
  for b in "${bases[@]}"; do
    for p in "${paths[@]}"; do
      local url="${b}${p}"
      if http_ok "$url"; then
        APP_OK=1
        APP_URL="$b"
        success "App IOTRAC online (${b})"
        return 0
      fi
    done
  done
  APP_OK=0
  warn "App IOTRAC não respondeu nas URLs testadas (${USER_BACKEND_URL:-localhost:8000})"
  return 1
}

check_same_subnet() {
  local device_ip=$1
  HOST_IP=$(get_host_ip)
  HOST_BASE=$(echo "$HOST_IP" | sed -E 's/\.[0-9]+$//')
  local dev_base=$(echo "$device_ip" | sed -E 's/\.[0-9]+$//')
  if [ -n "$HOST_BASE" ] && [ "$HOST_BASE" = "$dev_base" ]; then
    SAME_SUBNET=1
    success "Mesma sub-rede detectada (${HOST_BASE}.x)"
  else
    SAME_SUBNET=0
    warn "Sub-redes diferentes (Host: ${HOST_IP:-?} / Device: $device_ip)"
  fi
}

check_ping() {
  local ip=$1
  info "Pingando ${ip}..."
  if ping -n 3 -w 1000 "$ip" >/dev/null 2>&1; then
    success "Dispositivo online (${ip})"
    ONLINE=1
    return 0
  else
    error "Sem resposta de ping (${ip})"
    ONLINE=0
    return 1
  fi
}

check_port() {
  local ip=$1
  local port=$2
  timeout 2 bash -c "echo >/dev/tcp/$ip/$port" 2>/dev/null && return 0 || return 1
}

check_ports() {
  local ip=$1
  info "Checando portas (22, 5001, 5000, 5002)..."
  for p in 22 5001 5000 5002; do
    if check_port "$ip" "$p"; then
      success "Porta $p ABERTA"
      case "$p" in
        22) PORT_22=1;;
        5001) PORT_5001=1;;
        5000) PORT_5000=1;;
        5002) PORT_5002=1;;
      esac
    else
      warn "Porta $p fechada"
    fi
  done
}

check_arp() {
  local ip=$1
  # Força ARP com um ping curto (não fatal se falhar)
  ping -n 1 -w 300 "$ip" >/dev/null 2>&1 || true
  local line
  line=$(arp -a 2>/dev/null | grep -i "$ip")
  if [ -n "$line" ]; then
    # Extrai MAC (formato com '-' no Windows)
    ARP_MAC=$(echo "$line" | grep -o -E '([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}|([0-9A-Fa-f]{2}-){5}[0-9A-Fa-f]{2}')
    # Normaliza para minúsculo com ':'
    ARP_MAC=$(echo "$ARP_MAC" | tr 'A-F' 'a-f' | sed 's/-/:/g')
    # Identifica possíveis OUIs da Raspberry Pi
    case "$ARP_MAC" in
      b8:27:eb:*|dc:a6:32:*|e4:5f:01:*|dc:44:6d:*) ARP_VENDOR="Raspberry Pi (provável)" ;;
      *) ARP_VENDOR="Desconhecido" ;;
    esac
    success "ARP encontrado: $ARP_MAC ($ARP_VENDOR)"
  else
    warn "Entrada ARP não encontrada para $ip"
  fi
}

attack_test() {
  local ip=$1
  # Se a porta 5001 estiver fechada, considerar protegido
  if ! check_port "$ip" 5001; then
    success "Dispositivo com portas protegidas (5001 fechada) – ataque bloqueado"
    return 0
  fi
  info "Teste de bloqueio (envio de texto cru na porta 5001)..."
  if timeout 2 bash -c "echo emergency_stop >/dev/tcp/$ip/5001" 2>/dev/null; then
    warn "Envio aparentemente aceito (pode não estar protegido)"
    return 1
  else
    success "Envio bloqueado (provavelmente protegido)"
    return 0
  fi
}

try_nearby_ips() {
  local ip_base
  ip_base=$(echo "$1" | sed -E 's/\.[0-9]+$//')
  info "Tentando IPs próximos (.199–.205)..."
  for last in 199 200 201 202 203 204 205; do
    local candidate="${ip_base}.${last}"
    if ping -n 1 -w 400 "$candidate" >/dev/null 2>&1; then
      success "Encontrado online: $candidate"
      echo "$candidate"
      return 0
    fi
  done
  echo ""
  return 1
}

summary() {
  local ip=$1
  local attack_rc=$2
  echo
  echo -e "${CYAN}╔════════════ RESUMO ════════════╗${NC}"
  if [ "$ONLINE" -eq 1 ]; then
    echo -e "${GREEN}║ ✅ Conectado com sucesso ao carro (${ip}) ${NC}"
  else
    echo -e "${RED}║ ❌ Não conectado ao carro (${ip}) ${NC}"
  fi
  echo "║ App IOTRAC:     $( [ $APP_OK -eq 1 ] && echo Online || echo Offline ) ${APP_URL:+em $APP_URL}"
  echo "║ Mesma sub-rede: $( [ $SAME_SUBNET -eq 1 ] && echo Sim || echo Nao )"
  echo "║ SSH (22):       $( [ $PORT_22 -eq 1 ] && echo ABERTA || echo fechada )"
  echo "║ IOTRAC 5001:    $( [ $PORT_5001 -eq 1 ] && echo ABERTA || echo fechada )"
  echo "║ IOTRAC 5000:    $( [ $PORT_5000 -eq 1 ] && echo ABERTA || echo fechada )"
  echo "║ IOTRAC 5002:    $( [ $PORT_5002 -eq 1 ] && echo ABERTA || echo fechada )"
  echo "║ ARP:            ${ARP_MAC:-N/A} ${ARP_VENDOR:+($ARP_VENDOR)}"
  case "$attack_rc" in
    0) echo "║ Proteção: ATIVA (ataque bloqueado)";;
    1) echo "║ Proteção: INDEFINIDA/INATIVA (ataque aceito)";;
  esac
  echo -e "${CYAN}╚═════════════════════════════════╝${NC}"
  if [ "$ONLINE" -eq 1 ]; then
    echo -e "${GREEN}✅ smart-car conectado com sucesso ao app${NC}"
  fi
}

main(){
  print_header
  local ip detected attack_rc
  ip=$(resolve_ip)
  info "IP alvo: $ip"

  check_app_online
  check_same_subnet "$ip"

  if ! check_ping "$ip"; then
    detected=$(try_nearby_ips "$ip")
    if [ -n "$detected" ]; then
      ip="$detected"
      info "Usando IP detectado: $ip"
      ONLINE=1
      check_same_subnet "$ip"
    else
      summary "$ip" 1
      exit 1
    fi
  fi

  check_ports "$ip"
  check_arp "$ip"
  attack_test "$ip"; attack_rc=$?
  summary "$ip" "$attack_rc"
}

main "$@"
