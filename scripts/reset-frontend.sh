#!/bin/bash

# Script para resetar completamente o frontend do IOTRAC
# Limpa caches e reinicia o servidor

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[RESET]${NC} $1"
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

print_status "🔄 Resetando frontend do IOTRAC..."

# Parar processos do frontend
print_status "1. Parando processos do frontend..."
pkill -f "expo start" || true
pkill -f "metro" || true
pkill -f "react-native" || true

# Limpar caches
print_status "2. Limpando caches..."
cd iotrac-frontend

# Limpar cache do yarn
yarn cache clean

# Limpar cache do expo
npx expo install --fix

# Limpar cache do metro
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .expo-shared

# Limpar cache do React Native
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

print_success "Caches limpos!"

# Reinstalar dependências
print_status "3. Reinstalando dependências..."
rm -rf node_modules
rm -f yarn.lock
yarn install

print_success "Dependências reinstaladas!"

# Voltar ao diretório raiz
cd ..

print_status "4. Iniciando frontend limpo..."
cd iotrac-frontend
yarn start --clear

print_success "✅ Frontend resetado e iniciado!"
print_status "📱 Teste os botões agora - devem funcionar corretamente"
print_status "🔧 Se ainda houver problemas, verifique os logs do console" 