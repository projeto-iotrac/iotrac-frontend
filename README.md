# 📱 IOTRAC Frontend - App Mobile

[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49+-green.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Visão Geral

O **IOTRAC Frontend** é um aplicativo mobile desenvolvido em React Native/Expo que oferece uma interface intuitiva para gerenciar dispositivos IoT com sistema de proteção integrado. Com design moderno e funcionalidades avançadas, o app permite controle total sobre seus dispositivos IoT de forma segura e eficiente.

### ✨ Principais Funcionalidades

- 📱 **Interface Mobile Nativa**: App otimizado para dispositivos móveis
- 🔐 **Controle de Proteção**: Ativar/desativar proteção por dispositivo
- 📊 **Monitoramento em Tempo Real**: Status atualizado automaticamente
- 🎯 **Gerenciamento Intuitivo**: Adicionar, remover e configurar dispositivos
- 📈 **Logs Detalhados**: Visualização de atividades do sistema
- 🌐 **Conexão Segura**: Comunicação criptografada com o backend
- 🔄 **Sincronização Automática**: Dados sempre atualizados

## 🏗️ Arquitetura do App

```
┌─────────────────────────────────────────────────────────────┐
│                    IOTRAC Frontend - App Mobile             │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 1: Screens (src/screens/)                          │
│  ├── 📱 Lista de Dispositivos                              │
│  ├── ➕ Registro de Dispositivos                            │
│  ├── 🔍 Detalhes do Dispositivo                            │
│  └── ⚙️ Configurações e Logs                               │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 2: Components (src/components/)                    │
│  ├── 🎴 Cards de Dispositivos                              │
│  ├── 📋 Menus e Dropdowns                                  │
│  ├── 🔗 Status de Conexão                                  │
│  └── 🎨 Componentes UI                                     │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 3: Services (src/services/)                        │
│  ├── 🌐 API Communication                                  │
│  ├── 🔐 Authentication                                     │
│  └── 📊 Data Management                                     │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 4: Hooks & Utils (src/hooks/, src/utils/)          │
│  ├── 🎣 Custom Hooks                                       │
│  ├── 🛠️ Utility Functions                                  │
│  └── 📝 Type Definitions                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Instalação Rápida

### Pré-requisitos
- Node.js 18+ 
- Yarn ou npm
- Expo CLI (`npm install -g @expo/cli`)
- Backend IOTRAC rodando

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/iotrac-frontend.git
cd iotrac-frontend
```

2. **Instale as dependências**
```bash
yarn install
```

3. **Configure a API**
Edite `src/constants/ApiConfig.ts`:
```typescript
BASE_URL: 'http://192.168.1.100:8000', // IP do seu backend
```

4. **Prepare as configurações**
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

### Configuração do Expo

Os arquivos de configuração estão organizados na pasta `config/`:

- `app.config.js` - Configuração principal do Expo
- `app.json` - Metadados do aplicativo
- `babel.config.js` - Configuração do Babel
- `tsconfig.json` - Configuração do TypeScript
- `eslint.config.js` - Regras de linting

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

### 1. Iniciando o App

#### Opção A: Script Automático (Recomendado)
```bash
./start.sh
```

#### Opção B: Manual
```bash
# Terminal 1 - Backend
cd ../iotrac-backend
source venv/bin/activate
python src/main.py

# Terminal 2 - Frontend
cd iotrac-frontend
yarn start
```

### 2. Acessando o App

- **Expo DevTools**: `http://localhost:19002`
- **Web**: `http://localhost:19006`
- **Mobile**: Escaneie o QR code com Expo Go

### 3. Funcionalidades Principais

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

## 📊 Estrutura do Projeto

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
│   ├── config/               # Configurações
│   │   └── development.ts    # Configurações de desenvolvimento
│   ├── types/                # Definições de tipos
│   └── utils/                # Funções utilitárias
├── config/                   # Arquivos de configuração
├── scripts/                  # Scripts utilitários
├── assets/                   # Recursos estáticos
└── docs/                     # Documentação
```

## 🧪 Desenvolvimento

### Comandos Úteis

```bash
# Instalar dependências
yarn install

# Iniciar em modo desenvolvimento
yarn start

# Executar no Android
yarn android

# Executar no iOS
yarn ios

# Executar na web
yarn web

# Verificar tipos TypeScript
yarn tsc

# Linting
yarn lint

# Preparar configurações
yarn prepare-configs
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `start` | Inicia o servidor de desenvolvimento |
| `android` | Executa no Android |
| `ios` | Executa no iOS |
| `web` | Executa na web |
| `tsc` | Verifica tipos TypeScript |
| `lint` | Executa linting |
| `prepare-configs` | Cria symlinks de configuração |

## 🛡️ Segurança

### Medidas Implementadas

- **Validação de Entrada**: Todos os formulários validados
- **Comunicação Segura**: HTTPS com o backend
- **Autenticação**: Tokens JWT para API
- **Sanitização**: Dados limpos antes do envio
- **Error Handling**: Tratamento robusto de erros

### Boas Práticas

- ✅ Valide sempre dados de entrada
- ✅ Use HTTPS para comunicação
- ✅ Implemente timeout em requisições
- ✅ Trate erros graciosamente
- ✅ Mantenha dependências atualizadas

## 📱 Compatibilidade

### Plataformas Suportadas

- ✅ **Android**: 6.0+ (API 23+)
- ✅ **iOS**: 12.0+
- ✅ **Web**: Chrome, Firefox, Safari, Edge

### Dispositivos Testados

- Samsung Galaxy S21
- iPhone 12
- iPad Pro
- Emuladores Android/iOS

## 🆘 Solução de Problemas

### Problemas Comuns

#### ❌ App não carrega
**Sintomas:** Tela branca ou erro de carregamento

**Soluções:**
```bash
# 1. Verificar se o backend está rodando
curl http://localhost:8000/status

# 2. Verificar configuração da API
cat src/constants/ApiConfig.ts

# 3. Resetar cache do Expo
yarn start --clear

# 4. Reinstalar dependências
rm -rf node_modules yarn.lock
yarn install
```

#### ❌ Dependências não instalam
**Sintomas:** Erro durante `yarn install`

**Soluções:**
```bash
# 1. Limpar cache do yarn
yarn cache clean

# 2. Verificar versão do Node.js
node --version  # Deve ser 18+

# 3. Reinstalar com verbose
yarn install --verbose

# 4. Usar npm como alternativa
rm yarn.lock
npm install
```

#### ❌ Backend não conecta
**Sintomas:** Erro de conexão ou timeout

**Soluções:**
```bash
# 1. Verificar se o backend está rodando
cd ../iotrac-backend
source venv/bin/activate
python src/main.py

# 2. Testar conectividade
./scripts/test-connectivity.sh

# 3. Verificar firewall
sudo ufw status

# 4. Verificar IP da API
ip addr show
```

#### ❌ Configurações não funcionam
**Sintomas:** Ferramentas não encontram arquivos de configuração

**Soluções:**
```bash
# 1. Recriar symlinks
yarn prepare-configs

# 2. Verificar se os symlinks existem
ls -la | grep -E "(app\.config\.js|tsconfig\.json)"

# 3. Resetar configurações
./scripts/reset-frontend.sh
```

### Logs de Debug

Para obter mais informações sobre erros:

```bash
# Logs do Expo
yarn start --verbose

# Logs do Metro
yarn start --reset-cache

# Logs do TypeScript
yarn tsc --noEmit
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- Use TypeScript para todos os arquivos
- Siga as regras do ESLint
- Adicione testes para novas funcionalidades
- Mantenha a documentação atualizada
- Use hooks personalizados quando apropriado

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Roadmap

- [ ] Notificações push
- [ ] Modo offline
- [ ] Temas escuro/claro
- [ ] Suporte a múltiplos idiomas
- [ ] Dashboard com gráficos
- [ ] Backup/restore de configurações
- [ ] Integração com wearables

---

**IOTRAC Frontend** - Gerenciando IoT com estilo! 📱✨

*Desenvolvido com ❤️ para a comunidade IoT* 