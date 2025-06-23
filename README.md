# 📱 IOTRAC Frontend - App Mobile

[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49+-green.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 📋 Visão Geral

O **IOTRAC Frontend** é um aplicativo mobile desenvolvido em React Native/Expo que oferece interface intuitiva para gerenciar dispositivos IoT com sistema de proteção integrado. Design moderno com interface metálica e funcionalidades avançadas de segurança.

### ✨ Funcionalidades Principais

- 📱 **Interface Mobile Nativa** otimizada para dispositivos móveis
- 🔐 **Controle de Proteção** ativar/desativar por dispositivo
- 📊 **Monitoramento em Tempo Real** com atualização automática
- 🎯 **Gerenciamento Intuitivo** adicionar, remover e configurar dispositivos
- 📈 **Logs Detalhados** visualização de atividades do sistema
- 🌐 **Conexão Segura** comunicação criptografada com o backend
- 🎨 **Design Metálico** interface moderna com efeitos 3D

## 🚀 Instalação Rápida

### Pré-requisitos
- Node.js 18+
- Yarn ou npm
- Expo CLI (`npm install -g @expo/cli`)
- Backend IOTRAC rodando

### Passo a Passo

1. **Clone e entre no diretório**
```bash
git clone https://github.com/seu-usuario/iotrac-frontend.git
cd iotrac-frontend
```

2. **Instale dependências**
```bash
yarn install
```

3. **Configure a API**
Edite `src/constants/ApiConfig.ts`:
```typescript
BASE_URL: 'http://192.168.1.100:8000', // IP do seu backend
```

4. **Prepare configurações**
```bash
yarn prepare-configs
```

5. **Inicie o projeto**
```bash
yarn start
```

## ⚙️ Configuração

### Configuração da API

O arquivo `src/constants/ApiConfig.ts` controla a conexão com o backend:

```typescript
export const ApiConfig = {
  BASE_URL: 'http://192.168.1.100:8000', // Ajuste para o IP do seu servidor
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

### Scripts de Configuração

```bash
# Criar symlinks dos arquivos de configuração
yarn prepare-configs

# Resetar completamente o frontend
./scripts/reset-frontend.sh

# Testar conectividade
./scripts/test-connectivity.sh
```

## 🎮 Como Usar

### Iniciando o App

#### Opção A: Script Automático (Recomendado)
```bash
./start-iotrac.sh
```

#### Opção B: Manual
```bash
# Terminal 1 - Backend
cd ../iotrac-backend
source venv/bin/activate
python start_server.py

# Terminal 2 - Frontend
cd iotrac-frontend
yarn start
```

### Acessando o App

- **Expo DevTools**: `http://localhost:19002`
- **Web**: `http://localhost:19006`
- **Mobile**: Escaneie o QR code com Expo Go

### Funcionalidades Principais

#### 📱 Lista de Dispositivos
- Visualize todos os dispositivos registrados
- Status de proteção em tempo real
- Pull-to-refresh para atualizar dados

#### ➕ Adicionar Dispositivo
- Formulário com validação de IP
- Seleção de tipo de dispositivo
- Feedback visual de sucesso/erro

#### 🔍 Detalhes do Dispositivo
- Informações completas do dispositivo
- Controle de proteção individual
- Histórico de comandos

#### ⚙️ Configurações
- Logs do sistema em tempo real
- Status de conexão com o backend
- Configurações gerais

## 📁 Estrutura do Projeto

```
iotrac-frontend/
├── src/
│   ├── screens/              # Telas da aplicação
│   │   ├── index.tsx         # Lista de dispositivos
│   │   ├── new-device.tsx    # Registro de dispositivo
│   │   ├── device-details.tsx # Detalhes e controle
│   │   ├── settings.tsx      # Configurações e logs
│   │   └── _layout.tsx       # Layout de navegação
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Device.tsx        # Card de dispositivo
│   │   ├── DevicesMenu.tsx   # Menu de dispositivos
│   │   ├── Dropdown.tsx      # Dropdown customizado
│   │   ├── ConnectionStatus.tsx # Status de conexão
│   │   └── Banner.tsx        # Banner informativo
│   ├── services/             # Serviços de API
│   │   └── api.ts            # Comunicação com backend
│   ├── hooks/                # Custom hooks
│   │   └── useApi.ts         # Hook para API
│   ├── constants/            # Constantes
│   │   ├── ApiConfig.ts      # Configuração da API
│   │   └── Colors.ts         # Cores do tema
│   └── config/               # Configurações
│       └── development.ts    # Configurações de desenvolvimento
├── scripts/                  # Scripts de automação
│   ├── link-configs.sh       # Linkar configurações
│   ├── reset-frontend.sh     # Reset completo
│   └── test-connectivity.sh  # Testar conectividade
├── app.config.js             # Configuração do Expo
├── package.json              # Dependências
└── start-iotrac.sh           # Script de inicialização
```

## 🎨 Design System

### Cores Principais
- **Prateado**: `#E8E8E8`, `#F5F5F5` (cards e fundos)
- **Verde Limão**: `#32CD32` (elementos ativos)
- **Cinza**: `#666666` (elementos inativos)

### Características
- Interface metálica com efeitos 3D
- Animações suaves e feedback visual
- Design responsivo para diferentes dispositivos
- Componentes reutilizáveis e consistentes

## 🔧 Scripts Úteis

- `start-iotrac.sh` - Inicia backend e frontend automaticamente
- `scripts/reset-frontend.sh` - Reset completo do frontend
- `scripts/test-connectivity.sh` - Testa conexão com backend
- `scripts/link-configs.sh` - Prepara arquivos de configuração

## 🧪 Testes

### Teste de Conectividade
```bash
./scripts/test-connectivity.sh
```

### Verificação de Configuração
```bash
yarn prepare-configs
```

---

**Interface moderna para revolucionar o controle IoT** 🚀 