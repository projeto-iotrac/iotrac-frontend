# IOTRAC Frontend

Frontend React Native/Expo para o sistema IOTRAC - Gerenciamento de Dispositivos IoT com Proteção.

## �� Como Executar

### Script Principal (Recomendado)
```bash
cd iotrac-frontend
./start-iotrac.sh
```

### Manual (Se necessário)
```bash
# Terminal 1 - Backend
cd iotrac-backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd iotrac-frontend
yarn install
yarn start
```

## 🔧 Solução de Problemas

### Problema: Script trava na instalação das dependências
**Sintomas:** O script para na mensagem "📦 Instalando dependências do frontend..." e não retorna o prompt.

**Soluções:**

1. **Instalação manual das dependências:**
   ```bash
   cd iotrac-frontend
   yarn install --verbose
   ```

2. **Limpe o cache e reinstale:**
   ```bash
   cd iotrac-frontend
   rm -rf node_modules yarn.lock
   yarn install
   ```

3. **Verifique a conexão com a internet:**
   ```bash
   ./scripts/test-connectivity.sh
   ```

### Problema: Backend não inicia
**Soluções:**
```bash
cd iotrac-backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Problema: Frontend não inicia
**Soluções:**
```bash
cd iotrac-frontend
yarn install
yarn start
```

### Problema: Portas ocupadas
**Soluções:**
```bash
# Matar processos nas portas
sudo fuser -k 8000/tcp  # Backend
sudo fuser -k 19000/tcp # Expo
sudo fuser -k 8081/tcp  # Metro
```

## 📱 Acessos

- **Backend API:** http://localhost:8000
- **Expo DevTools:** http://localhost:19002
- **Web:** http://localhost:19006
- **Mobile:** http://localhost:8081

## 📋 Pré-requisitos

- Node.js 18+
- Yarn ou npm
- Python 3.8+
- pip
- curl

## 🛠️ Scripts Disponíveis

### `start-iotrac.sh`
Script principal que inicia backend e frontend automaticamente com:
- ✅ Verificação de dependências do sistema
- ✅ Limpeza de processos anteriores
- ✅ Instalação automática de dependências
- ✅ Timeout para evitar travamentos
- ✅ Monitoramento de processos
- ✅ Tratamento de erros robusto

### `scripts/reset-frontend.sh`
Reseta completamente o frontend (limpa cache, node_modules, etc.).

### `scripts/test-connectivity.sh`
Testa a conectividade com servidores externos.

### `scripts/link-configs.sh`
Cria symlinks dos arquivos de configuração na raiz.

## 🚀 Configuração Rápida

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI
- Backend IOTRAC rodando

### Instalação e Execução

#### Opção 1: Script Automático (Recomendado)
```bash
# Execute o script que inicia backend e frontend automaticamente
./scripts/start-iotrac.sh
```

#### Opção 2: Manual
1. **Instalar dependências:**
```bash
yarn install
```

2. **Verificar configuração da API:**
O arquivo `src/constants/ApiConfig.ts` deve estar configurado com o IP correto do backend:
```typescript
BASE_URL: 'http://192.168.112.180:8000', // Ajuste para o IP do seu servidor
```

3. **Iniciar o projeto:**
```bash
yarn start
```

4. **Executar no dispositivo:**
- Use o Expo Go no dispositivo móvel
- Escaneie o QR code
- O app deve carregar automaticamente

## 🛠️ Scripts de Configuração

Se alguma ferramenta reclamar que não encontra o arquivo de configuração na raiz, rode:

```bash
yarn prepare-configs
```

Isso cria symlinks automáticos dos arquivos de configuração da pasta `config/` para a raiz do projeto.

Assim, tudo funciona normalmente com qualquer ferramenta!

## 📱 Funcionalidades

### ✅ Implementado
- **Listagem de Dispositivos**: Carrega dispositivos dinamicamente da API
- **Registro de Dispositivos**: Formulário completo com validação de IP
- **Detalhes do Dispositivo**: Informações completas e controle de proteção
- **Controle de Proteção**: Ativar/desativar proteção por dispositivo
- **Logs do Sistema**: Visualização de logs em tempo real
- **Status de Conexão**: Indicador de conectividade com a API
- **Remoção de Dispositivos**: Botão de lixeira para remover dispositivos

### 🔧 Endpoints Utilizados
- `GET /devices` - Listar dispositivos
- `POST /device/register` - Registrar novo dispositivo
- `GET /devices/{id}` - Detalhes do dispositivo
- `DELETE /devices/{id}` - Remover dispositivo
- `GET /devices/{id}/protection` - Status de proteção do dispositivo
- `POST /devices/{id}/protection/toggle` - Alternar proteção do dispositivo
- `GET /status` - Status de proteção global
- `POST /toggle_protection` - Alternar proteção global
- `GET /logs` - Logs do sistema

## 🏗️ Estrutura do Projeto

```
iotrac-frontend/
├── src/
│   ├── screens/           # Telas da aplicação
│   │   ├── index.tsx      # Lista de dispositivos
│   │   ├── new-device.tsx # Registro de dispositivo
│   │   ├── device-details.tsx # Detalhes e controle
│   │   ├── settings.tsx   # Configurações e logs
│   │   └── _layout.tsx    # Layout de navegação
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Device.tsx     # Card de dispositivo
│   │   ├── DevicesMenu.tsx # Menu de dispositivos
│   │   ├── Dropdown.tsx   # Dropdown customizado
│   │   └── ConnectionStatus.tsx # Status de conexão
│   ├── services/          # Serviços de API
│   │   └── api.ts         # Cliente HTTP e tipos
│   ├── hooks/             # Hooks customizados
│   │   └── useApi.ts      # Hook para estados de API
│   ├── constants/         # Constantes e configurações
│   │   ├── Colors.ts      # Cores da aplicação
│   │   └── ApiConfig.ts   # Configuração da API
│   ├── config/            # Configurações de ambiente
│   │   └── development.ts # Configuração de desenvolvimento
│   ├── utils/             # Utilitários (vazio)
│   └── types/             # Tipos TypeScript (vazio)
├── assets/                # Recursos estáticos
├── docs/                  # Documentação e troubleshooting
└── [arquivos de configuração]
```

## 🔧 Configurações

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
API_BASE_URL=http://192.168.112.180:8000
API_TIMEOUT=10000
```

### Personalização
- **Cores**: Edite `src/constants/Colors.ts`
- **API**: Modifique `src/constants/ApiConfig.ts`
- **Tipos**: Ajuste interfaces em `src/services/api.ts`

## 🧪 Testes

Para testar a integração:

1. **Backend**: Certifique-se que o backend está rodando
2. **Dispositivos**: Adicione alguns dispositivos de teste
3. **Proteção**: Teste ativação/desativação por dispositivo
4. **Logs**: Verifique logs em tempo real
5. **Remoção**: Teste o botão de lixeira

## 📱 Compatibilidade

- **iOS**: 13.0+
- **Android**: API 21+
- **Web**: Chrome, Firefox, Safari

## 🚀 Deploy

### Desenvolvimento
```bash
npm start
```

### Produção
```bash
expo build
```

## 🔒 Segurança

- **HTTPS**: Recomendado para produção
- **Validação**: Validação de entrada no frontend
- **Sanitização**: Dados sanitizados antes do envio
- **Timeout**: Timeout configurável para requisições

## 🚨 Solução de Problemas

### Problema: App não carrega dispositivos
**Solução:**
1. Verifique se o backend está rodando:
   ```bash
   curl http://192.168.112.180:8000/
   ```
2. Confirme a URL da API em `src/constants/ApiConfig.ts`

### Problema: Erro de CORS
**Solução:** O backend já está configurado para aceitar requisições de qualquer origem.

### Problema: Dispositivo móvel não consegue acessar
**Solução:**
1. Verifique se o IP está correto:
   ```bash
   ip addr show | grep 192.168
   ```
2. Teste conectividade do dispositivo:
   ```bash
   ping 192.168.112.180
   ```

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique se o backend está rodando
2. Confirme a URL da API em `ApiConfig.ts`
3. Verifique logs do console
4. Teste conectividade com `ping` ou `curl`

---

**IOTRAC Frontend** - Sistema completo de gerenciamento IoT com proteção e monitoramento em tempo real. 