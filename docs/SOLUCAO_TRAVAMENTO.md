# 🔧 Solução para Travamento na Instalação das Dependências

## Problema Identificado

O script `start-iotrac.sh` estava travando na linha onde executa `yarn install` porque:
1. Redirecionava toda a saída para `/dev/null` (`> /dev/null 2>&1`)
2. Não tinha timeout para evitar travamentos infinitos
3. Não mostrava progresso da instalação

## Solução Implementada

### Script Principal Melhorado (`start-iotrac.sh`)

**Melhorias:**
- ✅ Remove redirecionamento para `/dev/null`
- ✅ Adiciona timeout de 10 minutos para `yarn install`
- ✅ Mostra progresso da instalação
- ✅ Verifica se `node_modules` já existe
- ✅ Usa `yarn install --check-files` para verificações rápidas
- ✅ Tratamento de erros robusto
- ✅ Monitoramento de processos

## Como Usar

### Script Principal (Recomendado):
```bash
cd iotrac-frontend
./start-iotrac.sh
```

### Solução Manual (Se necessário):
```bash
# Terminal 1 - Backend
cd iotrac-backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd iotrac-frontend
yarn install --verbose
yarn start
```

## Verificações

### Backend funcionando:
```bash
curl http://localhost:8000/
# Deve retornar: {"message":"IOTRAC - Camada 3 API","version":"1.0.0","status":"operational"}
```

### Frontend funcionando:
```bash
curl http://localhost:19000/  # Expo DevTools
curl http://localhost:8081/   # Metro bundler
```

## Prevenção

Para evitar o problema no futuro:
1. Use sempre o script principal `start-iotrac.sh`
2. Mantenha `node_modules` para execuções subsequentes
3. Use `yarn install --check-files` para verificações rápidas
4. Configure timeouts adequados nos scripts

## Logs Úteis

Se ainda houver problemas, verifique:
```bash
# Logs do yarn
yarn install --verbose

# Logs do Expo
yarn start --verbose

# Logs do backend
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
``` 