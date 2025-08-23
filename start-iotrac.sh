#!/bin/bash

# Script orquestrador único para IOTRAC
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[IOTRAC]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Resolver Python (python3 ou python) para compatibilidade multiplataforma
resolve_python() {
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_BIN=$(command -v python3)
    elif command -v python >/dev/null 2>&1; then
        PYTHON_BIN=$(command -v python)
    else
        print_error "❌ Python não encontrado! Instale Python3 ou Python."
        exit 1
    fi
}

# ===== SISTEMA DE VALIDAÇÃO SEGURA DE CREDENCIAIS =====

# Função para validar email via SMTP real
validate_email_smtp() {
    local email=$1
    local password=$2
    
    print_status "Testando SMTP..."
    
    # ENVIAR EMAIL REAL para validação (não apenas testar login)
    "$PYTHON_BIN" -c "
import smtplib
import ssl
import sys
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

try:
    # Configurações SMTP do Gmail
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    
    # Criar contexto SSL
    context = ssl.create_default_context()
    
    # Conectar, autenticar E ENVIAR EMAIL REAL
    with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
        server.starttls(context=context)
        server.login('$email', '$password')
        
        # Criar email de teste REAL
        msg = MIMEMultipart()
        msg['From'] = '$email'
        msg['To'] = '$email'
        msg['Subject'] = '🔒 IOTRAC - Validação de Email REAL'
        
        # Corpo do email
        body = f'''
🎉 SUCESSO! Email validado em {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

✅ Suas credenciais IOTRAC estão corretas!
✅ Sistema pode enviar emails de 2FA
✅ Configuração SMTP funcionando

Este email confirma que:
- Email: $email
- SMTP: Gmail configurado corretamente
- Status: Pronto para uso

IOTRAC Security System
        '''
        
        msg.attach(MIMEText(body, 'plain'))
        
        # ENVIAR EMAIL REAL
        server.send_message(msg)
    
    print('SUCCESS')
    sys.exit(0)
    
except smtplib.SMTPAuthenticationError:
    print('INVALID_CREDENTIALS')
    sys.exit(1)
except (smtplib.SMTPConnectError, socket.timeout, socket.error):
    print('CONNECTION_TIMEOUT')
    sys.exit(2)
except Exception as e:
    print(f'ERROR: {str(e)}')
    sys.exit(3)
" 2>/dev/null
}

# Função para validar LLM API key com Together AI
validate_llm_api_key() {
    local api_key=$1
    
    print_status "Testando LLM..."
    
    # Usar Python para teste LLM real com ENDPOINT CORRETO
    "$PYTHON_BIN" -c "
import requests
import json
import sys

try:
    # ENDPOINT CORRETO para Together AI
    url = 'https://api.together.xyz/v1/chat/completions'
    headers = {
        'Authorization': 'Bearer $api_key',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        'messages': [
            {'role': 'user', 'content': 'Hello, respond with just OK'}
        ],
        'max_tokens': 10,
        'temperature': 0.1
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    
    if response.status_code == 200:
        result = response.json()
        if 'choices' in result and len(result['choices']) > 0:
            print('SUCCESS')
            sys.exit(0)
        else:
            print('INVALID_RESPONSE')
            sys.exit(3)
    elif response.status_code == 401:
        print('INVALID_API_KEY')
        sys.exit(1)
    elif response.status_code in [503, 502, 504]:
        print('SERVICE_UNAVAILABLE')
        sys.exit(2)
    elif response.status_code == 429:
        print('RATE_LIMITED')
        sys.exit(7)
    else:
        print(f'HTTP_ERROR: {response.status_code}')
        sys.exit(3)
        
except requests.exceptions.Timeout:
    print('TIMEOUT')
    sys.exit(4)
except requests.exceptions.ConnectionError:
    print('CONNECTION_ERROR')
    sys.exit(5)
except Exception as e:
    print(f'ERROR: {str(e)}')
    sys.exit(6)
" 2>/dev/null
}

# Função principal de validação de credenciais
secure_credential_validation() {
    echo
    echo "╔══════════════════════════════════════╗"
    echo "║            IOTRAC v2.0               ║"
    echo "║        Sistema Iniciando...          ║"
    echo "╚══════════════════════════════════════╝"
    echo
    echo "🔐 VALIDAÇÃO SEGURA - IOTRAC"
    echo "Use senha de app do Gmail (não senha normal)"
    echo
    
    # ETAPA 1: Validação de Email (3 tentativas)
    local email_attempts=0
    local email_valid=false
    local user_email=""
    local user_password=""
    
    while [ $email_attempts -lt 3 ] && [ "$email_valid" = false ]; do
        email_attempts=$((email_attempts + 1))
        
        echo "[IOTRAC] Validando credenciais de email..."
        read -p "Email IOTRAC: " user_email
        if [ "$user_email" != "projetoiotrac@gmail.com" ]; then
          echo "[ERRO] Este email não está autorizado a iniciar o sistema."
          exit 1
        fi
        read -s -p "Senha de app Gmail: " user_password
        echo
        
        if [ -z "$user_email" ] || [ -z "$user_password" ]; then
            print_error "❌ Email e senha são obrigatórios"
            continue
        fi
        
        # Validação SMTP real
        validate_email_smtp "$user_email" "$user_password"
        local smtp_exit_code=$?
        
        case $smtp_exit_code in
            0)
                print_success "✅ Email validado - Verifique sua caixa de entrada!"
                print_status "📧 Email de confirmação enviado para: $user_email"
                email_valid=true
                ;;
            1)
                print_error "❌ Credenciais inválidas"
                if [ $email_attempts -eq 3 ]; then
                    print_error "❌ Máximo de tentativas excedido"
                    print_error "❌ Terminando sistema por segurança"
                    exit 1
                fi
                echo "Tentativa $email_attempts/3"
                ;;
            2)
                print_error "❌ Timeout de conexão SMTP"
                if [ $email_attempts -eq 3 ]; then
                    print_error "❌ Problemas de conectividade persistentes"
                    exit 1
                fi
                ;;
            *)
                print_error "❌ Erro de conexão"
                if [ $email_attempts -eq 3 ]; then
                    print_error "❌ Falha na validação de email"
                    exit 1
                fi
                ;;
        esac
    done
    
    if [ "$email_valid" = false ]; then
        print_error "❌ Falha na validação de email após 3 tentativas"
        print_error "❌ Acesso negado - Terminando sistema"
        exit 1
    fi
    
    # ETAPA 2: Validação de LLM API Key (3 tentativas, opcional)
    local llm_attempts=0
    local llm_valid=false
    local llm_api_key=""
    local llm_enabled=false
    local temp_key_file="/tmp/.iotrac_llm_temp_key"
    
    # VERIFICAR SE JÁ EXISTE CHAVE TEMPORÁRIA (de erro de conexão anterior)
    if [ -f "$temp_key_file" ]; then
        llm_api_key=$(cat "$temp_key_file" 2>/dev/null)
        if [ -n "$llm_api_key" ]; then
            print_status "🔑 Usando API KEY anterior (conexão anterior falhou)"
        fi
    fi
    
    # SE NÃO TEM CHAVE, PEDIR (OBRIGATÓRIO)
    if [ -z "$llm_api_key" ]; then
        echo "[IOTRAC] API KEY LLM (OBRIGATÓRIO):"
        read -p "Digite a API KEY: " llm_api_key
        
        if [ -z "$llm_api_key" ]; then
            print_error "❌ API KEY LLM é obrigatória para o sistema funcionar!"
            print_status "Sistema será encerrado."
            exit 1
        fi
    fi
    
    # VALIDAÇÃO LLM COM LÓGICA INTELIGENTE
    while [ "$llm_valid" = false ]; do
        print_status "[IOTRAC] Testando LLM..."
        
        # Validação LLM real
        validate_llm_api_key "$llm_api_key"
        local llm_exit_code=$?
        
        case $llm_exit_code in
            0)
                print_success "✅ LLM validada - IA avançada ativa"
                llm_valid=true
                llm_enabled=true
                # REMOVER ARQUIVO TEMPORÁRIO (sucesso)
                rm -f "$temp_key_file" 2>/dev/null
                ;;
            1)
                # CLAVE INCORRECTA - Contar intentos
                llm_attempts=$((llm_attempts + 1))
                print_error "❌ API KEY inválida (tentativa $llm_attempts/3)"
                
                if [ $llm_attempts -ge 3 ]; then
                    print_error "❌ Máximo de tentativas excedido!"
                    print_status "Sistema será encerrado."
                    rm -f "$temp_key_file" 2>/dev/null
                    exit 1
                fi
                
                # PEDIR NOVA CHAVE
                read -p "Digite a API KEY novamente: " llm_api_key
                if [ -z "$llm_api_key" ]; then
                    print_error "❌ API KEY é obrigatória!"
                    exit 1
                fi
                ;;
            2|4|5|7)
                # ERROR DE CONEXIÓN/RATE LIMIT - No contar como intento
                case $llm_exit_code in
                    2) print_warning "⚠️  Serviço temporariamente indisponível" ;;
                    4|5) print_warning "⚠️  Erro de conexão com Together AI" ;;
                    7) print_warning "⚠️  Rate limit atingido, aguarde alguns segundos" ;;
                esac
                
                # GUARDAR CHAVE TEMPORARIAMENTE
                echo "$llm_api_key" > "$temp_key_file"
                chmod 600 "$temp_key_file" 2>/dev/null
                
                # PREGUNTAR SE QUER TENTAR DE NOVO
                echo
                read -p "Ocorreu erro de conexão. Tentar novamente? (S/n): " retry_choice
                case "$retry_choice" in
                    [Nn]|[Nn][Oo])
                        print_error "❌ LLM é obrigatória para o sistema!"
                        print_status "Sistema será encerrado."
                        rm -f "$temp_key_file" 2>/dev/null
                        exit 1
                        ;;
                    *)
                        print_status "🔄 Tentando novamente em 3 segundos..."
                        sleep 3
                        ;;
                esac
                ;;
            *)
                print_error "❌ Erro desconhecido na validação LLM (código: $llm_exit_code)"
                print_status "Sistema será encerrado."
                rm -f "$temp_key_file" 2>/dev/null
                exit 1
                ;;
        esac
    done
    
    # ETAPA 3: Confirmação final
    echo
    print_success "✅ Credenciais validadas"
    echo "📧 Email: $user_email"
    if [ "$llm_enabled" = true ]; then
        echo "🤖 IA: Avançada"
    else
        echo "🤖 IA: Heurística"
    fi
    echo
    
    # Salvar credenciais em variáveis de ambiente temporárias
    export IOTRAC_EMAIL="$user_email"
    export IOTRAC_PASSWORD="$user_password"
    if [ "$llm_enabled" = true ]; then
        export IOTRAC_LLM_KEY="$llm_api_key"
    fi
    export IOTRAC_LLM_ENABLED="$llm_enabled"
    
    print_status "Configurando sistema..."
}

# Função para verificar e configurar chaves AES
setup_aes_keys() {
    print_status "🔐 Verificando configuração de chaves AES..."
    
    local backend_dir="../iotrac-backend"
    local env_file="$backend_dir/config/.env"
    local env_example="$backend_dir/config/env.example"
    
    # Verificar se o diretório backend existe
    if [ ! -d "$backend_dir" ]; then
        print_error "❌ Diretório backend não encontrado: $backend_dir"
        return 1
    fi
    
    # Verificar se arquivo .env existe
    if [ ! -f "$env_file" ]; then
        print_warning "⚠️  Arquivo .env não encontrado no backend"
        
        # Verificar se existe env.example
        if [ -f "$env_example" ]; then
            print_status "📋 Copiando env.example para .env..."
            cp "$env_example" "$env_file"
            print_success "✅ Arquivo .env criado a partir do env.example"
        else
            print_error "❌ Arquivo env.example não encontrado!"
            return 1
        fi
    fi
    
    # Verificar se as chaves estão configuradas corretamente
    local aes_key=$(grep "^AES_KEY=" "$env_file" | cut -d'=' -f2-)
    local hmac_key=$(grep "^HMAC_KEY=" "$env_file" | cut -d'=' -f2-)
    
    # Verificar se as chaves são válidas (não são placeholders)
    local aes_valid=false
    local hmac_valid=false
    
    if [ -n "$aes_key" ] && [ "$aes_key" != "sua_chave_aes_de_32_bytes_aqui_substitua_esta_chave" ]; then
        # Verificar se tem pelo menos 32 bytes
        local aes_length=$(echo -n "$aes_key" | wc -c)
        if [ "$aes_length" -ge 32 ]; then
            aes_valid=true
        fi
    fi
    
    if [ -n "$hmac_key" ] && [ "$hmac_key" != "sua_chave_hmac_de_32_bytes_aqui_substitua_esta_chave" ]; then
        # Verificar se tem pelo menos 32 bytes
        local hmac_length=$(echo -n "$hmac_key" | wc -c)
        if [ "$hmac_length" -ge 32 ]; then
            hmac_valid=true
        fi
    fi
    
    # Se alguma chave não for válida, gerar novas chaves
    if [ "$aes_valid" = false ] || [ "$hmac_valid" = false ]; then
        print_warning "⚠️  Chaves AES/HMAC não configuradas ou inválidas"
        print_status "🔑 Gerando novas chaves seguras..."
        
        # Garantir Python resolvido
        if [ -z "$PYTHON_BIN" ]; then
            resolve_python
        fi
        
        cd "$backend_dir"
        
        # Gerar AES_KEY
        local new_aes_key=$("$PYTHON_BIN" -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())")
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao gerar AES_KEY!"
            return 1
        fi
        
        # Gerar HMAC_KEY
        local new_hmac_key=$("$PYTHON_BIN" -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())")
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao gerar HMAC_KEY!"
            return 1
        fi
        
        # Fazer backup do arquivo .env
        cp "$env_file" "${env_file}.backup" 2>/dev/null || true
        
        # Atualizar as chaves no arquivo .env usando uma abordagem mais segura
        if [ "$aes_valid" = false ]; then
            # Usar awk para substituir de forma mais segura
            awk -v new_aes="$new_aes_key" '/^AES_KEY=/ {print "AES_KEY=" new_aes; next} {print}' "$env_file" > "${env_file}.tmp" && mv "${env_file}.tmp" "$env_file"
            if [ $? -eq 0 ]; then
                print_success "✅ AES_KEY gerada e configurada"
            else
                print_error "❌ Erro ao atualizar AES_KEY!"
                return 1
            fi
        fi
        
        if [ "$hmac_valid" = false ]; then
            # Usar awk para substituir de forma mais segura
            awk -v new_hmac="$new_hmac_key" '/^HMAC_KEY=/ {print "HMAC_KEY=" new_hmac; next} {print}' "$env_file" > "${env_file}.tmp" && mv "${env_file}.tmp" "$env_file"
            if [ $? -eq 0 ]; then
                print_success "✅ HMAC_KEY gerada e configurada"
            else
                print_error "❌ Erro ao atualizar HMAC_KEY!"
                return 1
            fi
        fi
        
        cd - > /dev/null
        print_success "🔐 Chaves de segurança configuradas com sucesso!"
    else
        print_success "✅ Chaves AES/HMAC já estão configuradas corretamente"
    fi
    
    return 0
}

# Função para verificar e instalar dependências do sistema
check_system_dependencies() {
    print_status "🔍 Verificando dependências do sistema..."
    
    # Verificar Python (python3 ou python)
    resolve_python
    print_success "✅ Python encontrado: $($PYTHON_BIN --version 2>/dev/null)"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "❌ Node.js não encontrado!"
        print_status "Por favor, instale Node.js:"
        print_status "Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
        print_status "Ou visite: https://nodejs.org/"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "❌ npm não encontrado!"
        exit 1
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        print_warning "⚠️  curl não encontrado. Instalando..."
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y curl
        elif command -v yum &> /dev/null; then
            sudo yum install -y curl
        else
            print_error "❌ Não foi possível instalar curl automaticamente"
            exit 1
        fi
    fi
    
    # Verificar netcat (para detecção de portas)
    if ! command -v nc &> /dev/null; then
        print_warning "⚠️  netcat não encontrado. Instalando..."
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y netcat-openbsd
        elif command -v yum &> /dev/null; then
            sudo yum install -y nc
        else
            print_warning "⚠️  Continuando sem netcat (detecção de porta limitada)"
        fi
    fi
    
    print_success "✅ Dependências do sistema verificadas!"
}

# Função para verificar se um processo está rodando
check_process() {
    local process_name=$1
    if pgrep -f "$process_name" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para matar processos ESPECÍFICOS do IOTRAC (SEM MATAR CURSOR!)
kill_processes() {
    print_status "🧹 Limpando processos IOTRAC anteriores..."
    
    # VERIFICAR se lsof está disponível
    if ! command -v lsof &> /dev/null; then
        print_warning "⚠️  lsof não disponível, usando métodos alternativos"
        # Fallback: usar netstat ou ss
        pkill -TERM -f "uvicorn.*src\.main:app" 2>/dev/null || true
        pkill -TERM -f "expo start" 2>/dev/null || true
        pkill -TERM -f "yarn start" 2>/dev/null || true
        sleep 2
        pkill -KILL -f "uvicorn.*src\.main:app" 2>/dev/null || true
        pkill -KILL -f "expo start" 2>/dev/null || true
        pkill -KILL -f "yarn start" 2>/dev/null || true
        print_success "✅ Processos IOTRAC limpos (método alternativo)"
        return
    fi
    
    # LISTA DE PUERTOS IOTRAC (ESPECÍFICOS)
    local iotrac_ports=(8000 19000 19001 19002 19006 8081)
    local killed_any=false
    
    # 1. LIMPAR PUERTOS ESPECÍFICOS DO IOTRAC
    for port in "${iotrac_ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_status "🔫 Matando processo na porta $port (IOTRAC)..."
            
            # Verificar se NÃO é processo do Cursor antes de matar
            local pids=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
            for pid in $pids; do
                local cmd=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
                if [[ "$cmd" != *"Cursor"* ]] && [[ "$cmd" != *"cursor"* ]]; then
                    kill -TERM $pid 2>/dev/null || true
                    killed_any=true
                else
                    print_warning "⚠️  Preservando processo Cursor (PID: $pid)"
                fi
            done
        fi
    done
    
    # Aguardar término gracioso
    if [ "$killed_any" = true ]; then
        sleep 2
        
        # 2. KILL FORÇADO se necessário
        for port in "${iotrac_ports[@]}"; do
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                local pids=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
                for pid in $pids; do
                    local cmd=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
                    if [[ "$cmd" != *"Cursor"* ]] && [[ "$cmd" != *"cursor"* ]]; then
                        kill -KILL $pid 2>/dev/null || true
                    fi
                done
            fi
        done
    fi
    
    # 3. PROCESSOS ESPECÍFICOS POR COMANDO (DUPLA VERIFICAÇÃO)
    local specific_patterns=(
        "uvicorn.*src\.main:app"
        "expo start"
        "yarn.*start.*iotrac"
        "node.*metro.*iotrac"
    )
    
    for pattern in "${specific_patterns[@]}"; do
        if pgrep -f "$pattern" >/dev/null 2>&1; then
            print_status "🎯 Matando: $pattern"
            pkill -TERM -f "$pattern" 2>/dev/null || true
            sleep 1
            pkill -KILL -f "$pattern" 2>/dev/null || true
        fi
    done
    
    # 4. VERIFICAÇÃO FINAL
    sleep 1
    local remaining=0
    for port in "${iotrac_ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            remaining=$((remaining + 1))
        fi
    done
    
    if [ $remaining -eq 0 ]; then
        print_success "✅ Todos os puertos IOTRAC limpos (Cursor preservado)"
    else
        print_warning "⚠️  $remaining puerto(s) ainda ocupado(s) - pode ser normal"
    fi
}

# Função para iniciar backend
start_backend() {
    print_status "🔧 Iniciando backend..."
    cd ../iotrac-backend
    
    # Verificação final das chaves AES antes de iniciar
    print_status "🔐 Verificação final das chaves AES..."
    local env_file="config/.env"
    
    if [ ! -f "$env_file" ]; then
        print_error "❌ Arquivo .env não encontrado no backend!"
        print_status "Execute o script novamente para configurar as chaves automaticamente"
        exit 1
    fi
    
    # Verificar se as chaves estão configuradas
    local aes_key=$(grep "^AES_KEY=" "$env_file" | cut -d'=' -f2-)
    local hmac_key=$(grep "^HMAC_KEY=" "$env_file" | cut -d'=' -f2-)
    
    if [ -z "$aes_key" ] || [ "$aes_key" = "sua_chave_aes_de_32_bytes_aqui_substitua_esta_chave" ] || [ $(echo -n "$aes_key" | wc -c) -lt 32 ]; then
        print_error "❌ AES_KEY não configurada corretamente!"
        print_status "Execute o script novamente para configurar as chaves automaticamente"
        exit 1
    fi
    
    if [ -z "$hmac_key" ] || [ "$hmac_key" = "sua_chave_hmac_de_32_bytes_aqui_substitua_esta_chave" ] || [ $(echo -n "$hmac_key" | wc -c) -lt 32 ]; then
        print_error "❌ HMAC_KEY não configurada corretamente!"
        print_status "Execute o script novamente para configurar as chaves automaticamente"
        exit 1
    fi
    
    print_success "✅ Chaves AES verificadas e válidas!"
    
    # Verificar e corrigir ambiente virtual corrompido
    print_status "🔍 Verificando ambiente virtual Python..."
    
    local venv_corrupted=false
    
    # Verificar se venv existe e se está corrompido (AppImage)
    if [ -d "venv" ]; then
        if [ -L "venv/bin/python3" ]; then
            local python_target=$(readlink "venv/bin/python3")
            if [[ "$python_target" == *"Cursor"* ]] || [[ "$python_target" == *"AppImage"* ]]; then
                print_warning "⚠️  Venv corrompido detectado (AppImage)"
                venv_corrupted=true
            fi
        fi
    fi
    
    # Recriar venv se corrompido ou não existir
    if [ "$venv_corrupted" = true ] || [ ! -d "venv" ]; then
        if [ "$venv_corrupted" = true ]; then
            print_status "🧹 Removendo venv corrompido..."
            rm -rf venv
        fi
        
        print_status "📦 Criando ambiente virtual Python limpo..."
        # Usar Python resolvido explicitamente
        "$PYTHON_BIN" -m venv venv
        
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao criar venv!"
            exit 1
        fi
        
        # Verificar se foi criado corretamente
        if [ -L "venv/bin/python3" ]; then
            local new_target=$(readlink "venv/bin/python3")
            if [[ "$new_target" == *"Cursor"* ]] || [[ "$new_target" == *"AppImage"* ]]; then
                print_error "❌ Venv ainda corrompido após recriação!"
                print_status "Tentando fallback sem venv..."
                rm -rf venv
                # Continuar sem venv
            else
                print_success "✅ Venv criado corretamente"
            fi
        fi
    else
        print_success "✅ Venv já existe e está válido"
    fi
    
    # Ativar venv se existe
    local using_venv=false
    if [ -d "venv" ] && [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        using_venv=true
        print_status "🐍 Usando ambiente virtual"
    else
        print_warning "⚠️  Usando Python do sistema (sem venv)"
    fi
    
    # Instalar dependências com fallbacks para diferentes sistemas
    print_status "📦 Instalando dependências Python..."
    print_status "⏳ Isso pode levar alguns minutos..."
    
    # Upgrade pip primeiro
    if [ "$using_venv" = true ]; then
        pip install --upgrade pip
    else
        # Fallback para sistema
        "$PYTHON_BIN" -m pip install --user --upgrade pip 2>/dev/null || true
    fi
    
    # Instalar requirements com fallbacks
    local install_success=false
    
    if [ "$using_venv" = true ]; then
        # Tentativa 1: venv normal
        if pip install -r requirements.txt; then
            install_success=true
        fi
    fi
    
    if [ "$install_success" = false ]; then
        print_warning "⚠️  Falha com venv, tentando instalação no usuário..."
        
        # Tentativa 2: --user (sem venv)
        if "$PYTHON_BIN" -m pip install --user -r requirements.txt; then
            install_success=true
        else
            # Tentativa 3: --break-system-packages (Kali Linux PEP 668)
            print_warning "⚠️  Tentando --break-system-packages (PEP 668)..."
            if "$PYTHON_BIN" -m pip install --user --break-system-packages -r requirements.txt; then
                install_success=true
                print_warning "⚠️  Usando --break-system-packages devido PEP 668"
            fi
        fi
    fi
    
    if [ "$install_success" = false ]; then
        print_error "❌ Falha ao instalar dependências Python em todos os métodos!"
        print_status "Métodos tentados:"
        print_status "1. Ambiente virtual (venv)"
        print_status "2. Instalação no usuário (--user)"
        print_status "3. Break system packages (--break-system-packages)"
        exit 1
    fi
    
    print_success "✅ Dependências Python instaladas!"
    
    # Iniciar servidor
    print_status "🚀 Iniciando servidor backend..."
    uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload &
    
    cd ../iotrac-frontend
    
    # Aguardar backend inicializar
    print_status "⏳ Aguardando backend inicializar..."
    sleep 5
    
    # Tentar verificar se o backend está rodando (usar múltiplos endpoints)
    local backend_ok=false
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ] && [ "$backend_ok" = false ]; do
        print_status "🔍 Tentativa $attempt/$max_attempts - Verificando backend..."
        
        # Testar endpoint raiz
        if curl -s http://localhost:8000/ > /dev/null 2>&1; then
            print_success "✅ Backend respondendo no endpoint raiz!"
            backend_ok=true
        # Testar endpoint de dispositivos
        elif curl -s http://localhost:8000/devices > /dev/null 2>&1; then
            print_success "✅ Backend respondendo no endpoint de dispositivos!"
            backend_ok=true
        # Testar endpoint de status
        elif curl -s http://localhost:8000/status > /dev/null 2>&1; then
            print_success "✅ Backend respondendo no endpoint de status!"
            backend_ok=true
        else
            print_warning "⚠️  Tentativa $attempt falhou. Aguardando 3 segundos..."
            sleep 3
            attempt=$((attempt + 1))
        fi
    done
    
    if [ "$backend_ok" = false ]; then
        print_error "❌ Falha ao conectar com o backend após $max_attempts tentativas!"
        print_status "🔍 Verificando logs do backend..."
        
        # Tentar capturar logs do backend
        cd ../iotrac-backend
        if [ -f "iotrac.log" ]; then
            print_status "📋 Últimas linhas do log do backend:"
            tail -10 iotrac.log 2>/dev/null || true
        fi
        
        print_status "🔧 Para debug manual, execute:"
        print_status "   cd ../iotrac-backend"
        print_status "   source venv/bin/activate"
        print_status "   python -c \"import os; from dotenv import load_dotenv; load_dotenv(); print('AES_KEY:', 'OK' if os.getenv('AES_KEY') and len(os.getenv('AES_KEY').encode()) >= 32 else 'ERRO')\""
        print_status "   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"
        exit 1
    fi
    
    print_success "✅ Backend iniciado e funcionando corretamente!"
}

# Função para limpeza inteligente do yarn
clean_yarn_dependencies() {
    print_status "🧹 Iniciando limpeza inteligente do yarn..."
    
    # Verificar se yarn está funcionando
    if ! yarn --version > /dev/null 2>&1; then
        print_warning "⚠️  Yarn não está funcionando corretamente. Reinstalando..."
        npm uninstall -g yarn 2>/dev/null || true
        npm install -g yarn
        if [ $? -ne 0 ]; then
            print_error "❌ Falha ao reinstalar yarn!"
            return 1
        fi
        print_success "✅ Yarn reinstalado com sucesso!"
    fi
    
    # Limpar cache do yarn
    print_status "🗑️  Limpando cache do yarn..."
    yarn cache clean 2>/dev/null || true
    
    # Verificar se node_modules está corrompido
    if [ -d "node_modules" ]; then
        print_status "🔍 Verificando integridade do node_modules..."
        
        # Tentar yarn install --check-files primeiro
        if yarn install --check-files --silent 2>/dev/null; then
            print_success "✅ node_modules está íntegro!"
            return 0
        else
            print_warning "⚠️  Problemas detectados no node_modules. Iniciando limpeza..."
        fi
    fi
    
    # Limpeza agressiva se necessário
    print_status "🧽 Limpeza agressiva em andamento..."
    
    # Remover arquivos problemáticos
    rm -rf node_modules 2>/dev/null || true
    rm -f yarn.lock 2>/dev/null || true
    rm -f package-lock.json 2>/dev/null || true
    rm -rf .yarn 2>/dev/null || true
    rm -rf .yarnrc 2>/dev/null || true
    
    # Limpar cache do npm também
    npm cache clean --force 2>/dev/null || true
    
    # Aguardar um pouco
    sleep 2
    
    # Tentar instalação limpa
    print_status "📦 Instalando dependências com instalação limpa..."
    print_status "⏳ Isso pode levar alguns minutos..."
    
    # Usar timeout para evitar travamento
    timeout 600 yarn install --verbose
    
    if [ $? -eq 124 ]; then
        print_error "❌ Timeout na instalação limpa (10 minutos)!"
        return 1
    elif [ $? -ne 0 ]; then
        print_warning "⚠️  Primeira tentativa falhou. Tentando com npm..."
        
        # Fallback para npm
        timeout 600 npm install
        
        if [ $? -eq 124 ]; then
            print_error "❌ Timeout na instalação com npm!"
            return 1
        elif [ $? -ne 0 ]; then
            print_error "❌ Falha na instalação com npm também!"
            return 1
        else
            print_success "✅ Dependências instaladas com npm!"
            return 0
        fi
    else
        print_success "✅ Limpeza e instalação concluídas com sucesso!"
        return 0
    fi
}

# Função para verificar e resolver problemas do yarn
check_and_fix_yarn() {
    print_status "🔍 Verificando saúde do yarn..."
    
    # Verificar se yarn está instalado
    if ! command -v yarn &> /dev/null; then
        print_warning "⚠️  Yarn não encontrado. Instalando..."
        npm install -g yarn
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao instalar Yarn!"
            return 1
        fi
        print_success "✅ Yarn instalado com sucesso!"
    fi
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        print_error "❌ package.json não encontrado!"
        return 1
    fi
    
    # Tentar instalação normal primeiro
    print_status "📦 Tentando instalação normal..."
    timeout 300 yarn install --silent
    
    if [ $? -eq 0 ]; then
        print_success "✅ Instalação normal bem-sucedida!"
        return 0
    elif [ $? -eq 124 ]; then
        print_warning "⚠️  Timeout na instalação normal. Iniciando limpeza..."
    else
        print_warning "⚠️  Problemas na instalação normal. Iniciando limpeza..."
    fi
    
    # Se chegou aqui, precisa de limpeza
    clean_yarn_dependencies
    return $?
}

# Função para iniciar frontend
start_frontend() {
    print_status "🌐 Iniciando Frontend..."
    # Já estamos no diretório frontend
    
    # Verificar e resolver problemas do yarn
    if ! check_and_fix_yarn; then
        print_error "❌ Falha ao resolver problemas do yarn!"
        print_status "Tente executar manualmente: cd iotrac-frontend && yarn install"
        exit 1
    fi
    
    # Verificar dependências críticas
    print_status "🔍 Verificando dependências críticas..."
    if ! node -e "require('@react-native-async-storage/async-storage')" 2>/dev/null; then
        print_warning "⚠️  AsyncStorage não encontrado. Instalando..."
        npm install @react-native-async-storage/async-storage
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao instalar AsyncStorage!"
            return 1
        fi
        print_success "✅ AsyncStorage instalado com sucesso!"
    else
        print_success "✅ AsyncStorage já está instalado"
    fi
    
    # Iniciar Expo (mostrar output para ver QR code)
    print_status "🚀 Iniciando Expo..."
    print_status "📱 Aguarde o QR code aparecer..."
    yarn start &
    
    # Aguardar frontend inicializar
    print_status "⏳ Aguardando frontend inicializar..."
    sleep 10
    
    # Verificar se o Expo está rodando
    if curl -s http://localhost:19000 > /dev/null 2>&1; then
        print_success "✅ Frontend iniciado com sucesso!"
    elif curl -s http://localhost:8081 > /dev/null 2>&1; then
        print_success "✅ Frontend iniciado com sucesso!"
    else
        print_warning "⚠️  Frontend pode estar iniciando ainda..."
        print_status "Verificando novamente em 5 segundos..."
        sleep 5
        if curl -s http://localhost:19000 > /dev/null 2>&1 || curl -s http://localhost:8081 > /dev/null 2>&1; then
            print_success "✅ Frontend iniciado com sucesso!"
        else
            print_error "❌ Falha ao iniciar o frontend!"
            exit 1
        fi
    fi
}

# Função para configurar .env do backend com credenciais validadas
configure_backend_env() {
    print_status "⚙️  Configurando .env do backend..."
    
    local backend_dir="../iotrac-backend"
    local env_file="$backend_dir/config/.env"
    
    if [ ! -f "$env_file" ]; then
        print_error "❌ Arquivo .env do backend não encontrado!"
        return 1
    fi
    
    # Fazer backup
    cp "$env_file" "${env_file}.backup" 2>/dev/null || true
    
    # Configurar EMAIL_USER e EMAIL_PASSWORD
    if [ -n "$IOTRAC_EMAIL" ] && [ -n "$IOTRAC_PASSWORD" ]; then
        # Atualizar EMAIL_USER
        if grep -q "^EMAIL_USER=" "$env_file"; then
            sed -i "s|^EMAIL_USER=.*|EMAIL_USER=$IOTRAC_EMAIL|" "$env_file"
        else
            echo "EMAIL_USER=$IOTRAC_EMAIL" >> "$env_file"
        fi
        
        # Atualizar EMAIL_PASSWORD
        if grep -q "^EMAIL_PASSWORD=" "$env_file"; then
            sed -i "s|^EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$IOTRAC_PASSWORD|" "$env_file"
        else
            echo "EMAIL_PASSWORD=$IOTRAC_PASSWORD" >> "$env_file"
        fi
        
        # Atualizar EMAIL_FROM
        if grep -q "^EMAIL_FROM=" "$env_file"; then
            sed -i "s|^EMAIL_FROM=.*|EMAIL_FROM=IOTRAC <$IOTRAC_EMAIL>|" "$env_file"
        else
            echo "EMAIL_FROM=IOTRAC <$IOTRAC_EMAIL>" >> "$env_file"
        fi
        
        print_success "✅ Credenciais de email configuradas no backend"
    fi
    
    # Configurar LLM_API_KEY se fornecida
    if [ "$IOTRAC_LLM_ENABLED" = true ] && [ -n "$IOTRAC_LLM_KEY" ]; then
        if grep -q "^LLM_API_KEY=" "$env_file"; then
            sed -i "s|^LLM_API_KEY=.*|LLM_API_KEY=$IOTRAC_LLM_KEY|" "$env_file"
        else
            echo "LLM_API_KEY=$IOTRAC_LLM_KEY" >> "$env_file"
        fi
        
        if grep -q "^LLM_PROVIDER=" "$env_file"; then
            sed -i "s|^LLM_PROVIDER=.*|LLM_PROVIDER=together|" "$env_file"
        else
            echo "LLM_PROVIDER=together" >> "$env_file"
        fi
        
        if grep -q "^LLM_MODEL=" "$env_file"; then
            sed -i "s|^LLM_MODEL=.*|LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo-Free|" "$env_file"
        else
            echo "LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo-Free" >> "$env_file"
        fi
        
        print_success "✅ Configuração LLM adicionada ao backend"
    else
        print_status "⚠️  LLM não configurado (pulado ou falhou)"
    fi
    
    return 0
}

# Função para detectar e configurar IP automaticamente (MELHORADA)
configure_network_ip() {
    print_status "🌐 Configurando IP da rede automaticamente..."
    
    # Detectar IP da interface principal com múltiplos métodos
    local ip_address=""
    
    # Método 1: hostname -I (mais confiável)
    ip_address=$(hostname -I | awk '{for(i=1;i<=NF;i++) if($i ~ /^192\.168\.|^10\.|^172\./) print $i}' | head -1)
    
    # Método 2: ip route (fallback)
    if [ -z "$ip_address" ]; then
        ip_address=$(ip route get 8.8.8.8 2>/dev/null | grep -oP 'src \K\S+' | head -1)
    fi
    
    # Método 3: ifconfig (fallback)
    if [ -z "$ip_address" ] && command -v ifconfig >/dev/null 2>&1; then
        ip_address=$(ifconfig | grep -E 'inet (192\.168\.|10\.|172\.)' | awk '{print $2}' | head -1)
    fi
    
    # Método 4: Detectar IP do colega automaticamente
    if [ -z "$ip_address" ]; then
        print_status "🔍 Detectando IP do colega automaticamente..."
        # Buscar IPs na rede local
        local network_ips=$(nmap -sn 192.168.1.0/24 2>/dev/null | grep -oP '192\.168\.1\.\d+' | head -5)
        if [ -n "$network_ips" ]; then
            # Usar primeiro IP encontrado que não seja gateway
            for ip in $network_ips; do
                if [ "$ip" != "192.168.1.1" ] && [ "$ip" != "192.168.1.254" ]; then
                    ip_address="$ip"
                    print_status "📡 IP do colega detectado: $ip_address"
                    break
                fi
            done
        fi
    fi
    
    # Fallback final
    if [ -z "$ip_address" ]; then
        ip_address="localhost"
        print_warning "⚠️  Usando localhost (não foi possível detectar IP da rede)"
    fi
    
    print_success "✅ IP detectado: $ip_address"
    
    # IMPLEMENTAR SISTEMA: .env + ApiConfig.ts
    local backend_url=""
    
    # 1. DETECTAR BACKEND DINÁMICAMENTE
    print_status "🔍 Detectando backend ativo..."
    
    # Verificar se backend está rodando na porta 8000
    if command -v nc &> /dev/null; then
        # Usar netcat se disponível
        if nc -z localhost 8000 2>/dev/null; then
            backend_url="http://localhost:8000"
            print_success "✅ Backend detectado em localhost:8000"
        elif nc -z "$ip_address" 8000 2>/dev/null; then
            backend_url="http://$ip_address:8000"
            print_success "✅ Backend detectado em $ip_address:8000"
        else
            print_warning "⚠️  Backend não detectado via netcat, usando localhost"
            backend_url="http://localhost:8000"
        fi
    else
        # Fallback: tentar curl diretamente
        if curl -s --connect-timeout 2 "http://localhost:8000/" >/dev/null 2>&1; then
            backend_url="http://localhost:8000"
            print_success "✅ Backend detectado em localhost:8000 (via curl)"
        elif curl -s --connect-timeout 2 "http://$ip_address:8000/" >/dev/null 2>&1; then
            backend_url="http://$ip_address:8000"
            print_success "✅ Backend detectado em $ip_address:8000 (via curl)"
        else
            print_warning "⚠️  Backend não detectado, usando localhost como padrão"
            backend_url="http://localhost:8000"
        fi
    fi
    
    # 2. CRIAR .env (formato correto)
print_status "📝 Criando .env automático..."
    echo "API_BASE_URL=$backend_url" > .env
    
    if [ $? -eq 0 ]; then
        print_success "✅ .env criado"
    else
        print_error "❌ Erro ao criar .env"
        return 1
    fi
    
    # 3. ATUALIZAR ApiConfig.ts AUTOMATICAMENTE
    local config_file="src/constants/ApiConfig.ts"
    if [ -f "$config_file" ]; then
        print_status "⚙️  Atualizando ApiConfig.ts automaticamente..."
        
        # Fazer backup
        cp "$config_file" "${config_file}.backup" 2>/dev/null || true
        
        # Substituir qualquer BASE_URL existente
        sed -i "s|BASE_URL: '[^']*'|BASE_URL: '$backend_url'|g" "$config_file"
        
        if grep -q "$backend_url" "$config_file"; then
            print_success "✅ ApiConfig.ts atualizado para: $backend_url"
        else
            print_error "❌ Falha ao atualizar ApiConfig.ts"
            return 1
        fi
    else
        print_error "❌ ApiConfig.ts não encontrado em $config_file"
        return 1
    fi
    
    # 4. VERIFICAR CONFIGURAÇÃO FINAL
    print_status "🔍 Verificando configuração final..."
    if curl -s "$backend_url/" >/dev/null 2>&1; then
        print_success "✅ Backend acessível em $backend_url"
        
        # Mostrar resumo
        echo
        print_success "🎉 CONFIGURAÇÃO IMPLEMENTADA:"
        print_status "   • .env criado com BASE_URL: $backend_url"
        print_status "   • ApiConfig.ts atualizado automaticamente"
        print_status "   • Backend verificado e funcionando"
        print_status "   • Sistema pronto para usar!"
        echo
        
        return 0
    else
        print_warning "⚠️  Backend não acessível, mas configuração aplicada"
        print_status "   • Verifique se o backend está rodando"
        print_status "   • URL configurada: $backend_url"
        return 0
    fi
}

# Função de limpeza ao sair
cleanup_on_exit() {
    print_status "🧹 Limpando credenciais..."
    
    # 1. LIMPAR VARIÁVEIS TEMPORÁRIAS
    unset IOTRAC_EMAIL
    unset IOTRAC_PASSWORD
    unset IOTRAC_LLM_KEY
    unset IOTRAC_LLM_ENABLED
    
    # 2. LIMPAR .env DO BACKEND (OPCIONAL - DESABILITADO POR PADRÃO)
    local backend_env="../iotrac-backend/config/.env"
    if [ -f "$backend_env" ]; then
        if [ "${IOTRAC_SECURE_CLEANUP}" = "true" ]; then
            print_status "🔐 Limpando credenciais do .env do backend..."
            sed -i 's|^EMAIL_USER=.*|EMAIL_USER=seu_email@gmail.com|' "$backend_env" 2>/dev/null || true
            sed -i 's|^EMAIL_PASSWORD=.*|EMAIL_PASSWORD=sua_senha_de_app_gmail|' "$backend_env" 2>/dev/null || true
            sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=IOTRAC <seu_email@gmail.com>|' "$backend_env" 2>/dev/null || true
            sed -i 's|^LLM_API_KEY=.*|LLM_API_KEY=sua_chave_llm_aqui|' "$backend_env" 2>/dev/null || true
            print_success "✅ Credenciais removidas do .env (segurança garantida)"
        else
            print_status "ℹ️  Limpeza de .env do backend pulada (IOTRAC_SECURE_CLEANUP!=true)"
        fi
    fi
    
    # 3. REMOVER BACKUPS COM CREDENCIAIS
    rm -f "../iotrac-backend/config/.env.backup" 2>/dev/null || true
    
    # 4. REMOVER ARQUIVO TEMPORÁRIO DE LLM
    rm -f "/tmp/.iotrac_llm_temp_key" 2>/dev/null || true
    
    print_success "✅ Limpeza completa concluída"
}

# Função principal
main() {
    # Registrar limpeza automática ao sair (TODAS AS SITUAÇÕES)
    trap cleanup_on_exit EXIT SIGINT SIGTERM SIGQUIT SIGHUP
    
    # Resolver Python antes de tudo
    resolve_python
    
    # ETAPA 1: Validação segura de credenciais (NOVA!)
    secure_credential_validation
    
    # ETAPA 2: Verificações básicas
    print_status "🚀 Iniciando IOTRAC - Sistema de Gerenciamento IoT"
    
    # Verificar diretório
    if [ ! -d "../iotrac-backend" ]; then
        print_error "❌ Execute este script dentro do diretório iotrac-frontend"
        print_status "Certifique-se de que a pasta '../iotrac-backend' existe"
        exit 1
    fi
    
    # Verificar dependências do sistema
    check_system_dependencies
    
    # ETAPA 3: Configurações automáticas (ORDEM AJUSTADA)
    # 1) Configurar .env do backend com credenciais
    configure_backend_env
    # 2) Verificar e configurar chaves AES
    setup_aes_keys
    # 3) Detectar IP e configurar frontend
    configure_network_ip
    
    # ETAPA 4: Inicialização
    # Limpar processos anteriores (MELHORADO!)
    kill_processes
    
    # Iniciar serviços
    start_backend
    start_frontend
    
    print_success "✨ IOTRAC iniciado com sucesso!"
    echo
    echo "🎉 SISTEMA RESTAURADO COMPLETAMENTE!"
    echo "✅ Validação segura de credenciais"
    echo "✅ Detecção automática de IP"
    echo "✅ Configuração automática de .env"
    echo "✅ Correção de venv corrompido"
    echo "✅ Kill de processos específicos"
    echo "✅ Suporte para PEP 668 (Kali Linux)"
    echo "✅ Integração LLM configurada"
    echo
    print_status "📡 Backend: http://localhost:8000"
    print_status "📱 Expo DevTools: http://localhost:19002"
    print_status "🌐 Web: http://localhost:19006"
    print_status "📱 Mobile: http://localhost:8081"
    print_status ""
    print_status "🔍 Para ver o QR code do Expo:"
    print_status "   1. Abra http://localhost:19002 no navegador"
    print_status "   2. Ou aguarde o QR code aparecer no terminal"
    print_status "   3. Escaneie com o app Expo Go no seu celular"
    print_status ""
    print_status "🤖 IA IOTRAC configurada:"
    if [ "$IOTRAC_LLM_ENABLED" = true ]; then
        print_status "   • IA Avançada: Together AI (Llama-3.3-70B)"
        print_status "   • IA Heurística: Regras locais"
    else
        print_status "   • IA Heurística: Regras locais"
    fi
    print_status "   • Endpoints: /ai/query, /ai/summary, /ai/recommendations"
    print_status ""
    print_status "Para parar, pressione Ctrl+C"
    
    # Registrar handler para Ctrl+C
    trap 'print_status "🛑 Parando Iotrac..."; kill_processes; cleanup_on_exit; exit 0' SIGINT SIGTERM
    
    # Manter script rodando e monitorar processos
    while true; do
        if ! check_process "uvicorn" || ! check_process "expo"; then
            print_error "❌ Um dos serviços parou inesperadamente!"
            kill_processes
            exit 1
        fi
        sleep 5
    done
}

# Executar script
main 