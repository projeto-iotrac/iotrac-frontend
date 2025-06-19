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
    
    # Tentar verificar se o backend está rodando (usar endpoint raiz /)
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        print_success "✅ Backend iniciado com sucesso!"
    else
        print_warning "⚠️  Backend pode estar iniciando ainda..."
        print_status "Verificando novamente em 5 segundos..."
        sleep 5
        if curl -s http://localhost:8000/ > /dev/null 2>&1; then
            print_success "✅ Backend iniciado com sucesso!"
        else
            print_error "❌ Falha ao iniciar o backend!"
            exit 1
        fi
    fi
}

# Função para iniciar frontend
start_frontend() {
    print_status "🌐 Iniciando Frontend..."
    # Já estamos no diretório frontend
    
    # Instalar yarn se necessário
    if ! command -v yarn &> /dev/null; then
        print_warning "⚠️  Yarn não encontrado. Instalando..."
        npm install -g yarn
        if [ $? -ne 0 ]; then
            print_error "❌ Erro ao instalar Yarn!"
            exit 1
        fi
        print_success "✅ Yarn instalado com sucesso!"
    fi
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        print_status "📦 Instalando dependências do frontend..."
        print_status "⏳ Isso pode levar alguns minutos na primeira vez..."
        
        # Usar timeout para evitar travamento
        timeout 600 yarn install
        
        if [ $? -eq 124 ]; then
            print_error "❌ Timeout na instalação das dependências (10 minutos)!"
            print_status "Tente executar manualmente: cd iotrac-frontend && yarn install"
            exit 1
        elif [ $? -ne 0 ]; then
            print_error "❌ Erro ao instalar dependências do frontend!"
            print_status "Tente executar manualmente: cd iotrac-frontend && yarn install"
            exit 1
        fi
        
        print_success "✅ Dependências instaladas com sucesso!"
    else
        print_status "📦 Verificando dependências do frontend..."
        yarn install --check-files
        if [ $? -ne 0 ]; then
            print_warning "⚠️  Problemas com dependências. Reinstalando..."
            rm -rf node_modules yarn.lock
            timeout 600 yarn install
            if [ $? -eq 124 ]; then
                print_error "❌ Timeout na reinstalação das dependências!"
                exit 1
            elif [ $? -ne 0 ]; then
                print_error "❌ Erro ao reinstalar dependências!"
                exit 1
            fi
        fi
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