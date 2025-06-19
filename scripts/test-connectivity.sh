#!/bin/bash

# Script de teste de conectividade para IOTRAC
# Testa se o frontend consegue se conectar ao backend

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# IP da máquina
IP_ADDRESS="192.168.112.180"
BACKEND_PORT="8000"

print_status "🔍 Testando conectividade do IOTRAC..."

# Teste 1: Verificar se o backend está rodando
print_status "1. Verificando se o backend está rodando na porta $BACKEND_PORT..."
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    print_success "Backend está rodando na porta $BACKEND_PORT"
else
    print_error "Backend NÃO está rodando na porta $BACKEND_PORT"
    exit 1
fi

# Teste 2: Testar conectividade local
print_status "2. Testando conectividade local (localhost:$BACKEND_PORT)..."
if curl -s http://localhost:$BACKEND_PORT/ > /dev/null; then
    print_success "Conectividade local OK"
else
    print_error "Falha na conectividade local"
fi

# Teste 3: Testar conectividade via IP da rede
print_status "3. Testando conectividade via IP da rede ($IP_ADDRESS:$BACKEND_PORT)..."
if curl -s http://$IP_ADDRESS:$BACKEND_PORT/ > /dev/null; then
    print_success "Conectividade via IP da rede OK"
else
    print_error "Falha na conectividade via IP da rede"
fi

# Teste 4: Testar endpoint específico
print_status "4. Testando endpoint /devices..."
RESPONSE=$(curl -s http://$IP_ADDRESS:$BACKEND_PORT/devices)
if [ $? -eq 0 ]; then
    print_success "Endpoint /devices respondeu: $RESPONSE"
else
    print_error "Falha no endpoint /devices"
fi

# Teste 5: Verificar configuração do frontend
print_status "5. Verificando configuração do frontend..."
if grep -q "BASE_URL.*$IP_ADDRESS:$BACKEND_PORT" src/constants/ApiConfig.ts; then
    print_success "Frontend configurado corretamente para $IP_ADDRESS:$BACKEND_PORT"
else
    print_warning "Frontend pode não estar configurado corretamente"
    echo "Configuração atual:"
    grep "BASE_URL" src/constants/ApiConfig.ts
fi

# Teste 6: Verificar se o frontend está rodando
print_status "6. Verificando se o frontend está rodando..."
if lsof -i :8081 > /dev/null 2>&1; then
    print_success "Frontend está rodando na porta 8081"
else
    print_warning "Frontend não está rodando na porta 8081"
fi

print_status "✅ Teste de conectividade concluído!"
print_status "📱 Se todos os testes passaram, o app deve funcionar corretamente"
print_status "🔧 Se houver problemas, verifique:"
print_status "   - Firewall bloqueando conexões"
print_status "   - Configuração de rede"
print_status "   - Logs do backend e frontend" 