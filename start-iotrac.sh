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
        
        # Gerar chaves usando Python
        cd "$backend_dir"
        
        # Verificar se Python está disponível
        if ! command -v python3 &> /dev/null; then
            print_error "❌ Python3 não encontrado para gerar chaves!"
            return 1
        fi
        
        # Gerar AES_KEY
        local new_aes_key=$(python3 -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())")
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao gerar AES_KEY!"
            return 1
        fi
        
        # Gerar HMAC_KEY
        local new_hmac_key=$(python3 -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())")
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
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        print_error "❌ Python3 não encontrado!"
        print_status "Por favor, instale Python3:"
        print_status "Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv"
        print_status "CentOS/RHEL: sudo yum install python3 python3-pip"
        exit 1
    fi
    
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

# Função para matar processos
kill_processes() {
    print_status "🧹 Limpando processos anteriores..."
    
    # Lista de processos para matar
    local processes=("uvicorn" "expo" "node" "python" "metro")
    for proc in "${processes[@]}"; do
        # Usar SIGTERM primeiro, depois SIGKILL se necessário
        pkill -TERM -f "$proc" 2>/dev/null || true
        sleep 1
        pkill -KILL -f "$proc" 2>/dev/null || true
    done
    
    # Lista de portas para liberar
    local ports=(8000 19000 19001 19002 19006)
    for port in "${ports[@]}"; do
        fuser -k "$port/tcp" 2>/dev/null || true
    done
    
    sleep 2
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
    
    # Criar e ativar ambiente virtual
    if [ ! -d "venv" ]; then
        print_status "📦 Criando ambiente virtual Python..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Instalar dependências
    print_status "📦 Instalando dependências Python..."
    print_status "⏳ Isso pode levar alguns minutos..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        print_error "❌ Erro ao instalar dependências Python!"
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

# Função para detectar e configurar IP automaticamente
configure_network_ip() {
    print_status "🌐 Configurando IP da rede automaticamente..."
    
    # Detectar IP da interface principal (excluir localhost e IPv6)
    local ip_address=$(hostname -I | awk '{for(i=1;i<=NF;i++) if($i ~ /^192\.168\.|^10\.|^172\./) print $i}' | head -1)
    
    if [ -z "$ip_address" ]; then
        # Fallback para localhost se não encontrar IP da rede
        ip_address="localhost"
        print_warning "⚠️  Não foi possível detectar IP da rede, usando localhost"
    fi
    
    print_status "📍 IP detectado: $ip_address"
    
    # Atualizar arquivo de configuração do frontend
    local config_file="src/constants/ApiConfig.ts"
    if [ -f "$config_file" ]; then
        # Fazer backup
        cp "$config_file" "${config_file}.backup" 2>/dev/null || true
        
        # Atualizar IP na configuração usando sed mais robusto
        sed -i "s|BASE_URL: 'http://[^']*'|BASE_URL: 'http://$ip_address:8000'|g" "$config_file"
        
        if [ $? -eq 0 ]; then
            print_success "✅ Configuração de IP atualizada para: $ip_address"
            return 0
        else
            print_warning "⚠️  Não foi possível atualizar configuração automaticamente"
            # Restaurar backup
            mv "${config_file}.backup" "$config_file" 2>/dev/null || true
            return 1
        fi
    else
        print_warning "⚠️  Arquivo de configuração não encontrado: $config_file"
        return 1
    fi
}

# Função principal
main() {
    print_status "🚀 Iniciando IOTRAC - Sistema de Gerenciamento IoT"
    
    # Verificar diretório
    if [ ! -d "../iotrac-backend" ]; then
        print_error "❌ Execute este script dentro do diretório iotrac-frontend"
        print_status "Certifique-se de que a pasta '../iotrac-backend' existe"
        exit 1
    fi
    
    # Verificar dependências do sistema
    check_system_dependencies
    
    # Configurar IP automaticamente
    configure_network_ip
    
    # Verificar e configurar chaves AES
    setup_aes_keys
    
    # Limpar processos anteriores
    kill_processes
    
    # Iniciar serviços
    start_backend
    start_frontend
    
    print_success "✨ IOTRAC iniciado com sucesso!"
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
    print_status "Para parar, pressione Ctrl+C"
    
    # Registrar handler para Ctrl+C
    trap 'print_status "🛑 Parando Iotrac..."; kill_processes; exit 0' SIGINT SIGTERM
    
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