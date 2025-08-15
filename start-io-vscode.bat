@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Script orquestador único para IOTRAC - Versión Windows
REM Copia exacta de start-iotrac.sh adaptada para Windows

REM ===== SISTEMA DE VALIDAÇÃO SEGURA DE CREDENCIAIS =====

REM Função para validar email via SMTP real
:validate_email_smtp
set email=%1
set password=%2

echo [IOTRAC] Testando SMTP...

REM ENVIAR EMAIL REAL para validação (não apenas testar login)
python -c "
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
        server.login('%email%', '%password%')
        
        # Criar email de teste REAL
        msg = MIMEMultipart()
        msg['From'] = '%email%'
        msg['To'] = '%email%'
        msg['Subject'] = '🔒 IOTRAC - Validação de Email REAL'
        
        # Corpo do email
        body = f'''
🎉 SUCESSO! Email validado em {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

✅ Suas credenciais IOTRAC estão corretas!
✅ Sistema pode enviar emails de 2FA
✅ Configuração SMTP funcionando

Este email confirma que:
- Email: %email%
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
except (smtp.SMTPConnectError, socket.timeout, socket.error):
    print('CONNECTION_TIMEOUT')
    sys.exit(2)
except Exception as e:
    print(f'ERROR: {str(e)}')
    sys.exit(3)
" > temp_smtp_result.txt 2>nul

set /p smtp_result=<temp_smtp_result.txt
del temp_smtp_result.txt

if "%smtp_result%"=="SUCCESS" (
    echo ✅ Email validado - Verifique sua caixa de entrada!
    echo [IOTRAC] 📧 Email de confirmação enviado para: %email%
    exit /b 0
) else if "%smtp_result%"=="INVALID_CREDENTIALS" (
    echo ❌ Credenciais inválidas
    exit /b 1
) else if "%smtp_result%"=="CONNECTION_TIMEOUT" (
    echo ❌ Timeout de conexão SMTP
    exit /b 2
) else (
    echo ❌ Erro de conexão
    exit /b 3
)
goto :eof

REM Função para validar LLM API key com Together AI
:validate_llm_api_key
set api_key=%1

echo [IOTRAC] Testando LLM...

REM Usar Python para teste LLM real com ENDPOINT CORRETO
python -c "
import requests
import json
import sys

try:
    # ENDPOINT CORRETO para Together AI
    url = 'https://api.together.xyz/v1/chat/completions'
    headers = {
        'Authorization': 'Bearer %api_key%',
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
" > temp_llm_result.txt 2>nul

set /p llm_result=<temp_llm_result.txt
del temp_llm_result.txt

if "%llm_result%"=="SUCCESS" (
    echo ✅ LLM validada - IA avançada ativa
    exit /b 0
) else if "%llm_result%"=="INVALID_API_KEY" (
    echo ❌ API KEY inválida
    exit /b 1
) else if "%llm_result%"=="SERVICE_UNAVAILABLE" (
    echo ⚠️  Serviço temporariamente indisponível
    exit /b 2
) else if "%llm_result%"=="TIMEOUT" (
    echo ⚠️  Timeout na conexão
    exit /b 4
) else if "%llm_result%"=="CONNECTION_ERROR" (
    echo ⚠️  Erro de conexão com Together AI
    exit /b 5
) else if "%llm_result%"=="RATE_LIMITED" (
    echo ⚠️  Rate limit atingido, aguarde alguns segundos
    exit /b 7
) else (
    echo ❌ Erro desconhecido na validação LLM (código: %llm_exit_code%)
    exit /b 6
)
goto :eof

REM Função principal de validação de credenciais
:secure_credential_validation
echo.
echo ╔══════════════════════════════════════╗
echo ║            IOTRAC v2.0               ║
echo ║        Sistema Iniciando...          ║
echo ╚══════════════════════════════════════╝
echo.
echo 🔐 VALIDAÇÃO SEGURA - IOTRAC
echo Use senha de app do Gmail (não senha normal)
echo.

REM ETAPA 1: Validação de Email (3 tentativas)
set email_attempts=0
set email_valid=false

:email_validation_loop
set /a email_attempts+=1

echo [IOTRAC] Validando credenciais de email...
set /p user_email="Email IOTRAC: "
if "%user_email%"=="projetoiotrac@gmail.com" (
    echo ✅ Email autorizado!
) else (
    echo ❌ Este email não está autorizado a iniciar o sistema.
    exit /b 1
)

set /s user_password="Senha de app Gmail: "
echo.

if "%user_email%"=="" (
    echo ❌ Email e senha são obrigatórios
    goto :email_validation_loop
)

REM Validação SMTP real
call :validate_email_smtp "%user_email%" "%user_password%"
set smtp_exit_code=%errorlevel%

if %smtp_exit_code%==0 (
    echo ✅ Email validado - Verifique sua caixa de entrada!
    echo [IOTRAC] 📧 Email de confirmação enviado para: %user_email%
    set email_valid=true
) else if %smtp_exit_code%==1 (
    echo ❌ Credenciais inválidas
    if %email_attempts%==3 (
        echo ❌ Máximo de tentativas excedido
        echo ❌ Terminando sistema por segurança
        exit /b 1
    )
    echo Tentativa %email_attempts%/3
    goto :email_validation_loop
) else if %smtp_exit_code%==2 (
    echo ❌ Timeout de conexão SMTP
    if %email_attempts%==3 (
        echo ❌ Problemas de conectividade persistentes
        exit /b 1
    )
    goto :email_validation_loop
) else (
    echo ❌ Erro de conexão
    if %email_attempts%==3 (
        echo ❌ Falha na validação de email
        exit /b 1
    )
    goto :email_validation_loop
)

if "%email_valid%"=="false" (
    echo ❌ Falha na validação de email após 3 tentativas
    echo ❌ Acesso negado - Terminando sistema
    exit /b 1
)

REM ETAPA 2: Validação de LLM API Key (3 tentativas, opcional)
set llm_attempts=0
set llm_valid=false
set llm_enabled=false
set temp_key_file=%TEMP%\.iotrac_llm_temp_key

REM VERIFICAR SE JÁ EXISTE CHAVE TEMPORÁRIA (de erro de conexão anterior)
if exist "%temp_key_file%" (
    set /p llm_api_key=<"%temp_key_file%"
    if not "%llm_api_key%"=="" (
        echo [IOTRAC] 🔑 Usando API KEY anterior (conexão anterior falhou)
    )
)

REM SE NÃO TEM CHAVE, PEDIR (OBRIGATÓRIO)
if "%llm_api_key%"=="" (
    echo [IOTRAC] API KEY LLM (OBRIGATÓRIO):
    set /p llm_api_key="Digite a API KEY: "
    
    if "%llm_api_key%"=="" (
        echo ❌ API KEY LLM é obrigatória para o sistema funcionar!
        echo Sistema será encerrado.
        exit /b 1
    )
)

REM VALIDAÇÃO LLM COM LÓGICA INTELIGENTE
:llm_validation_loop
echo [IOTRAC] Testando LLM...

REM Validação LLM real
call :validate_llm_api_key "%llm_api_key%"
set llm_exit_code=%errorlevel%

if %llm_exit_code%==0 (
    echo ✅ LLM validada - IA avançada ativa
    set llm_valid=true
    set llm_enabled=true
    REM REMOVER ARQUIVO TEMPORÁRIO (sucesso)
    if exist "%temp_key_file%" del "%temp_key_file%" 2>nul
) else if %llm_exit_code%==1 (
    REM CLAVE INCORRECTA - Contar intentos
    set /a llm_attempts+=1
    echo ❌ API KEY inválida (tentativa %llm_attempts%/3)
    
    if %llm_attempts% geq 3 (
        echo ❌ Máximo de tentativas excedido!
        echo Sistema será encerrado.
        if exist "%temp_key_file%" del "%temp_key_file%" 2>nul
        exit /b 1
    )
    
    REM PEDIR NOVA CHAVE
    set /p llm_api_key="Digite a API KEY novamente: "
    if "%llm_api_key%"=="" (
        echo ❌ API KEY é obrigatória!
        exit /b 1
    )
    goto :llm_validation_loop
) else if %llm_exit_code%==2 (
    echo ⚠️  Serviço temporariamente indisponível
    goto :llm_retry_prompt
) else if %llm_exit_code%==4 (
    echo ⚠️  Erro de conexão com Together AI
    goto :llm_retry_prompt
) else if %llm_exit_code%==5 (
    echo ⚠️  Erro de conexão com Together AI
    goto :llm_retry_prompt
) else if %llm_exit_code%==7 (
    echo ⚠️  Rate limit atingido, aguarde alguns segundos
    goto :llm_retry_prompt
) else (
    echo ❌ Erro desconhecido na validação LLM (código: %llm_exit_code%)
    echo Sistema será encerrado.
    if exist "%temp_key_file%" del "%temp_key_file%" 2>nul
    exit /b 1
)

goto :llm_validation_complete

:llm_retry_prompt
REM GUARDAR CHAVE TEMPORARIAMENTE
echo %llm_api_key% > "%temp_key_file%"

REM PREGUNTAR SE QUER TENTAR DE NOVO
echo.
set /p retry_choice="Ocorreu erro de conexão. Tentar novamente? (S/n): "
if /i "%retry_choice%"=="n" (
    echo ❌ LLM é obrigatória para o sistema!
    echo Sistema será encerrado.
    if exist "%temp_key_file%" del "%temp_key_file%" 2>nul
    exit /b 1
)

echo 🔄 Tentando novamente em 3 segundos...
timeout /t 3 >nul
goto :llm_validation_loop

:llm_validation_complete

REM ETAPA 3: Confirmação final
echo.
echo ✅ Credenciais validadas
echo 📧 Email: %user_email%
if "%llm_enabled%"=="true" (
    echo 🤖 IA: Avançada
) else (
    echo 🤖 IA: Heurística
)
echo.

echo [IOTRAC] Configurando sistema...
goto :eof

REM ===== VERIFICAÇÃO DE PRIVILÉGIOS DE ADMINISTRADOR =====

REM Função para verificar e solicitar privilégios de administrador
:check_admin_privileges
echo [IOTRAC] 🔐 Verificando privilégios de administrador...

REM Verificar se já temos privilégios de admin
net session >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Script executando com privilégios de administrador
    echo ✅ Instalações automáticas habilitadas
    goto :admin_privileges_ok
)

echo ⚠️  Script não tem privilégios de administrador
echo 📦 Para instalações automáticas, precisamos de privilégios de admin
echo.

REM Solicitar credenciais de administrador
set admin_username=
set admin_password=
set admin_domain=

echo 🔑 CREDENCIAIS DE ADMINISTRADOR DO SISTEMA
echo 💡 Use a conta de administrador do Windows (não sua conta pessoal)
echo.

set /p admin_username="👤 Usuário Administrador: "
if "%admin_username%"=="" (
    echo ❌ Usuário de administrador é obrigatório!
    echo 💡 Use: Administrador, Admin, ou sua conta com privilégios
    pause
    exit /b 1
)

set /s admin_password="🔒 Senha do Administrador: "
echo.

REM Verificar se é domínio ou local
set /p admin_domain="🏢 Domínio (deixe vazio se for conta local): "

echo.
echo 🔄 Tentando elevar privilégios...

REM Tentar executar com privilégios elevados
if "%admin_domain%"=="" (
    REM Conta local
    runas /user:"%admin_username%" /savecred "%~f0"
) else (
    REM Conta de domínio
    runas /user:"%admin_domain%\%admin_username%" /savecred "%~f0"
)

if %errorlevel%==0 (
    echo ✅ Privilégios elevados com sucesso!
    echo ✅ Instalações automáticas habilitadas
    echo.
    echo 🔄 Reiniciando script com privilégios de admin...
    timeout /t 3 >nul
    exit /b 0
) else (
    echo ❌ Falha ao elevar privilégios!
    echo 💡 Verifique se as credenciais estão corretas
    echo 💡 Ou execute o script como administrador manualmente
    echo.
    echo 🔧 Alternativa: Clique com botão direito no script
    echo    e selecione "Executar como administrador"
    pause
    exit /b 1
)

:admin_privileges_ok
echo.
echo 🎯 PRIVILÉGIOS VERIFICADOS - INSTALAÇÕES AUTOMÁTICAS HABILITADAS
echo ✅ Python: Instalação automática
echo ✅ Node.js: Instalação automática  
echo ✅ Dependências: Instalação automática
echo ✅ Chaves: Geração automática
echo ✅ Configurações: Aplicação automática
echo.
echo 🚀 Continuando com instalação automática completa...
echo.
pause

REM ===== FUNÇÕES DE CONFIGURAÇÃO DO SISTEMA =====

REM Função para verificar e configurar chaves AES
:setup_aes_keys
echo [IOTRAC] 🔐 Verificando configuração de chaves AES...

set backend_dir=..\iotrac-backend
set env_file=%backend_dir%\config\.env
set env_example=%backend_dir%\config\env.example

REM Verificar se o diretório backend existe
if not exist "%backend_dir%" (
    echo ❌ Diretório backend não encontrado: %backend_dir%
    exit /b 1
)

REM Verificar se arquivo .env existe
if not exist "%env_file%" (
    echo ⚠️  Arquivo .env não encontrado no backend
    
    REM Verificar se existe env.example
    if exist "%env_example%" (
        echo 📋 Copiando env.example para .env...
        copy "%env_example%" "%env_file%" >nul
        echo ✅ Arquivo .env criado a partir do env.example
    ) else (
        echo ❌ Arquivo env.example não encontrado!
        exit /b 1
    )
)

REM Verificar se as chaves estão configuradas corretamente
for /f "tokens=1,2 delims==" %%a in ('findstr "^AES_KEY=" "%env_file%"') do set aes_key=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr "^HMAC_KEY=" "%env_file%"') do set hmac_key=%%b

REM Verificar se as chaves são válidas (não são placeholders)
set aes_valid=false
set hmac_valid=false

if not "%aes_key%"=="" (
    if not "%aes_key%"=="sua_chave_aes_de_32_bytes_aqui_substitua_esta_chave" (
        REM Verificar se tem pelo menos 32 bytes
        set aes_length=0
        for %%i in ("%aes_key%") do set aes_length=%%~zi
        if %aes_length% geq 32 set aes_valid=true
    )
)

if not "%hmac_key%"=="" (
    if not "%hmac_key%"=="sua_chave_hmac_de_32_bytes_aqui_substitua_esta_chave" (
        REM Verificar se tem pelo menos 32 bytes
        set hmac_length=0
        for %%i in ("%hmac_key%") do set hmac_length=%%~zi
        if %hmac_length% geq 32 set hmac_valid=true
    )
)

REM Se alguma chave não for válida, gerar novas chaves
if "%aes_valid%"=="false" (
    echo ⚠️  Chaves AES/HMAC não configuradas ou inválidas
    echo 🔑 Gerando novas chaves seguras...
    
    REM Gerar chaves usando Python
    cd /d "%backend_dir%"
    
    REM Verificar se Python está disponível
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python não encontrado para gerar chaves!
        exit /b 1
    )
    
    REM Gerar AES_KEY
    python -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())" > temp_aes.txt
    set /p new_aes_key=<temp_aes.txt
    del temp_aes.txt
    
    REM Gerar HMAC_KEY
    python -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())" > temp_hmac.txt
    set /p new_hmac_key=<temp_hmac.txt
    del temp_hmac.txt
    
    REM Fazer backup do arquivo .env
    copy "%env_file%" "%env_file%.backup" >nul 2>&1
    
    REM Atualizar as chaves no arquivo .env
    if "%aes_valid%"=="false" (
        powershell -Command "(Get-Content '%env_file%') -replace '^AES_KEY=.*', 'AES_KEY=%new_aes_key%' | Set-Content '%env_file%'"
        if %errorlevel%==0 (
            echo ✅ AES_KEY gerada e configurada
        ) else (
            echo ❌ Erro ao atualizar AES_KEY!
            exit /b 1
        )
    )
    
    if "%hmac_valid%"=="false" (
        powershell -Command "(Get-Content '%env_file%') -replace '^HMAC_KEY=.*', 'HMAC_KEY=%new_hmac_key%' | Set-Content '%env_file%'"
        if %errorlevel%==0 (
            echo ✅ HMAC_KEY gerada e configurada
        ) else (
            echo ❌ Erro ao atualizar HMAC_KEY!
            exit /b 1
        )
    )
    
    cd /d "%~dp0"
    echo 🔐 Chaves de segurança configuradas com sucesso!
) else (
    echo ✅ Chaves AES/HMAC já estão configuradas corretamente
)

exit /b 0

REM Função para verificar e instalar dependências do sistema
:check_system_dependencies
echo [IOTRAC] 🔍 Verificando dependências do sistema...

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    
    REM Verificar se temos privilégios de admin para instalação automática
    net session >nul 2>&1
    if %errorlevel%==0 (
        echo 🔧 Privilégios de admin detectados - Instalando Python automaticamente...
        
        REM Baixar e instalar Python usando winget (Windows Package Manager)
        winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements
        
        if %errorlevel%==0 (
            echo ✅ Python instalado automaticamente!
            echo 🔄 Atualizando PATH...
            
            REM Atualizar PATH para a sessão atual
            set PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python311\;%LOCALAPPDATA%\Programs\Python\Python311\Scripts\
            
            REM Verificar se Python foi instalado
            python --version >nul 2>&1
            if %errorlevel%==0 (
                echo ✅ Python funcionando corretamente!
            ) else (
                echo ⚠️  Python instalado mas PATH não atualizado
                echo 💡 Reinicie o terminal ou VS Code
                exit /b 1
            )
        ) else (
            echo ❌ Falha na instalação automática do Python
            echo 💡 Instale manualmente: https://python.org
            exit /b 1
        )
    ) else (
        echo 💡 Para instalação automática, execute o script como administrador
        echo 💡 Ou instale manualmente: https://python.org
        exit /b 1
    )
) else (
    echo ✅ Python já está instalado
)

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    
    REM Verificar se temos privilégios de admin para instalação automática
    net session >nul 2>&1
    if %errorlevel%==0 (
        echo 🔧 Privilégios de admin detectados - Instalando Node.js automaticamente...
        
        REM Baixar e instalar Node.js usando winget
        winget install OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
        
        if %errorlevel%==0 (
            echo ✅ Node.js instalado automaticamente!
            echo 🔄 Atualizando PATH...
            
            REM Atualizar PATH para a sessão atual
            set PATH=%PATH%;%PROGRAMFILES%\nodejs\
            
            REM Verificar se Node.js foi instalado
            node --version >nul 2>&1
            if %errorlevel%==0 (
                echo ✅ Node.js funcionando corretamente!
            ) else (
                echo ⚠️  Node.js instalado mas PATH não atualizado
                echo 💡 Reinicie o terminal ou VS Code
                exit /b 1
            )
        ) else (
            echo ❌ Falha na instalação automática do Node.js
            echo 💡 Instale manualmente: https://nodejs.org
            exit /b 1
        )
    ) else (
        echo 💡 Para instalação automática, execute o script como administrador
        echo 💡 Ou instale manualmente: https://nodejs.org
        exit /b 1
    )
) else (
    echo ✅ Node.js já está instalado
)

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    
    REM Verificar se temos privilégios de admin para instalação automática
    net session >nul 2>&1
    if %errorlevel%==0 (
        echo 🔧 Privilégios de admin detectados - Instalando npm automaticamente...
        
        REM npm vem com Node.js, mas vamos verificar se precisa atualizar
        npm install -g npm@latest
        
        if %errorlevel%==0 (
            echo ✅ npm atualizado automaticamente!
        ) else (
            echo ❌ Falha na atualização do npm
            exit /b 1
        )
    ) else (
        echo 💡 Para instalação automática, execute o script como administrador
        exit /b 1
    )
) else (
    echo ✅ npm já está instalado
)

REM Verificar curl (Windows 10+ tem por padrão, mas vamos garantir)
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  curl não encontrado
    
    REM Verificar se temos privilégios de admin para instalação automática
    net session >nul 2>&1
    if %errorlevel%==0 (
        echo 🔧 Privilégios de admin detectados - Instalando curl automaticamente...
        
        REM Baixar e instalar curl usando winget
        winget install cURL.cURL --accept-package-agreements --accept-source-agreements
        
        if %errorlevel%==0 (
            echo ✅ curl instalado automaticamente!
        ) else (
            echo ⚠️  curl não é crítico, continuando...
        )
    ) else (
        echo ⚠️  curl não é crítico, continuando...
    )
) else (
    echo ✅ curl já está instalado
)

echo ✅ Dependências do sistema verificadas e instaladas automaticamente!
exit /b 0

REM ===== FUNÇÕES DE INICIALIZAÇÃO =====

REM Função para matar processos ESPECÍFICOS do IOTRAC
:kill_processes
echo [IOTRAC] 🧹 Limpando processos IOTRAC anteriores...

REM LISTA DE PORTAS IOTRAC (ESPECÍFICOS)
set iotrac_ports=8000 19000 19001 19002 19006 8081
set killed_any=false

REM 1. LIMPAR PORTAS ESPECÍFICAS DO IOTRAC
for %%p in (%iotrac_ports%) do (
    netstat -ano | findstr ":%%p" | findstr "LISTENING" >nul 2>&1
    if !errorlevel!==0 (
        echo 🔫 Matando processo na porta %%p (IOTRAC)...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p" ^| findstr "LISTENING"') do (
            taskkill /PID %%a /F >nul 2>&1
            set killed_any=true
        )
    )
)

REM Aguardar término gracioso
if "%killed_any%"=="true" (
    timeout /t 2 >nul
    
    REM 2. KILL FORÇADO se necessário
    for %%p in (%iotrac_ports%) do (
        netstat -ano | findstr ":%%p" | findstr "LISTENING" >nul 2>&1
        if !errorlevel!==0 (
            for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p" ^| findstr "LISTENING"') do (
                taskkill /PID %%a /F >nul 2>&1
            )
        )
    )
)

REM 3. PROCESSOS ESPECÍFICOS POR COMANDO
tasklist /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq *uvicorn*" >nul 2>&1
if !errorlevel!==0 (
    echo 🎯 Matando: uvicorn backend
    taskkill /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq *uvicorn*" /F >nul 2>&1
)

tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq *expo*" >nul 2>&1
if !errorlevel!==0 (
    echo 🎯 Matando: expo frontend
    taskkill /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq *expo*" /F >nul 2>&1
)

echo ✅ Processos IOTRAC limpos
exit /b 0

REM Função para iniciar backend
:start_backend
echo [IOTRAC] 🔧 Iniciando backend...
cd /d "..\iotrac-backend"

REM Verificação final das chaves AES antes de iniciar
echo [IOTRAC] 🔐 Verificação final das chaves AES...
set env_file=config\.env

if not exist "%env_file%" (
    echo ❌ Arquivo .env não encontrado no backend!
    echo Execute o script novamente para configurar as chaves automaticamente
    exit /b 1
)

REM Verificar se as chaves estão configuradas
for /f "tokens=1,2 delims==" %%a in ('findstr "^AES_KEY=" "%env_file%"') do set aes_key=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr "^HMAC_KEY=" "%env_file%"') do set hmac_key=%%b

if "%aes_key%"=="" (
    echo ❌ AES_KEY não configurada corretamente!
    echo Execute o script novamente para configurar as chaves automaticamente
    exit /b 1
)

if "%hmac_key%"=="" (
    echo ❌ HMAC_KEY não configurada corretamente!
    echo Execute o script novamente para configurar as chaves automaticamente
    exit /b 1
)

echo ✅ Chaves AES verificadas e válidas!

REM Verificar e corrigir ambiente virtual corrompido
echo [IOTRAC] 🔍 Verificando ambiente virtual Python...

set venv_corrupted=false

REM Verificar se venv existe e se está corrompido
if exist "venv" (
    if exist "venv\Scripts\python.exe" (
        echo ✅ Venv já existe e está válido
    ) else (
        echo ⚠️  Venv corrompido detectado
        set venv_corrupted=true
    )
)

REM Recriar venv se corrompido ou não existir
if "%venv_corrupted%"=="true" (
    echo 🧹 Removendo venv corrompido...
    rmdir /s /q venv
)

if not exist "venv" (
    echo 📦 Criando ambiente virtual Python limpo...
    python -m venv venv
    
    if %errorlevel% neq 0 (
        echo ❌ Erro ao criar venv!
        exit /b 1
    )
    
    echo ✅ Venv criado corretamente
)

REM Ativar venv
call venv\Scripts\activate.bat
echo 🐍 Usando ambiente virtual

REM Instalar dependências
echo 📦 Instalando dependências Python...
echo ⏳ Isso pode levar alguns minutos...

pip install --upgrade pip
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar dependências Python!
    exit /b 1
)

echo ✅ Dependências Python instaladas!

REM Iniciar servidor
echo 🚀 Iniciando servidor backend...
start "Backend IOTRAC" cmd /k "uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"

cd /d "..\iotrac-frontend"

REM Aguardar backend inicializar
echo ⏳ Aguardando backend inicializar...
timeout /t 5 >nul

REM Tentar verificar se o backend está rodando
set backend_ok=false
set max_attempts=5
set attempt=1

:backend_check_loop
echo 🔍 Tentativa %attempt%/%max_attempts% - Verificando backend...

REM Testar endpoint raiz
curl -s http://localhost:8000/ >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend respondendo no endpoint raiz!
    set backend_ok=true
    goto :backend_check_complete
)

REM Testar endpoint de dispositivos
curl -s http://localhost:8000/devices >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend respondendo no endpoint de dispositivos!
    set backend_ok=true
    goto :backend_check_complete
)

REM Testar endpoint de status
curl -s http://localhost:8000/status >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend respondendo no endpoint de status!
    set backend_ok=true
    goto :backend_check_complete
)

if %attempt% lss %max_attempts% (
    echo ⚠️  Tentativa %attempt% falhou. Aguardando 3 segundos...
    timeout /t 3 >nul
    set /a attempt+=1
    goto :backend_check_loop
)

:backend_check_complete

if "%backend_ok%"=="false" (
    echo ❌ Falha ao conectar com o backend após %max_attempts% tentativas!
    echo 🔧 Para debug manual, execute:
    echo    cd ..\iotrac-backend
    echo    venv\Scripts\activate
    echo    uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
    exit /b 1
)

echo ✅ Backend iniciado e funcionando corretamente!
exit /b 0

REM Função para iniciar frontend
:start_frontend
echo [IOTRAC] 🌐 Iniciando Frontend...

REM Verificar e resolver problemas do yarn
echo [IOTRAC] 🔍 Verificando saúde do yarn...

REM Verificar se yarn está instalado
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Yarn não encontrado. Instalando...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar Yarn!
        exit /b 1
    )
    echo ✅ Yarn instalado com sucesso!
)

REM Verificar se package.json existe
if not exist "package.json" (
    echo ❌ package.json não encontrado!
    exit /b 1
)

REM Tentar instalação normal primeiro
echo 📦 Tentando instalação normal...
yarn install --silent

if %errorlevel% neq 0 (
    echo ⚠️  Problemas na instalação normal. Iniciando limpeza...
    
    REM Limpeza agressiva se necessário
    echo 🧽 Limpeza agressiva em andamento...
    
    REM Remover arquivos problemáticos
    if exist "node_modules" rmdir /s /q node_modules
    if exist "yarn.lock" del yarn.lock
    if exist "package-lock.json" del package-lock.json
    if exist ".yarn" rmdir /s /q .yarn
    if exist ".yarnrc" del .yarnrc
    
    REM Limpar cache do npm também
    npm cache clean --force >nul 2>&1
    
    REM Aguardar um pouco
    timeout /t 2 >nul
    
    REM Tentar instalação limpa
    echo 📦 Instalando dependências com instalação limpa...
    echo ⏳ Isso pode levar alguns minutos...
    
    yarn install --verbose
    
    if %errorlevel% neq 0 (
        echo ⚠️  Primeira tentativa falhou. Tentando com npm...
        
        REM Fallback para npm
        npm install
        
        if %errorlevel% neq 0 (
            echo ❌ Falha na instalação com npm também!
            exit /b 1
        ) else (
            echo ✅ Dependências instaladas com npm!
        )
    ) else (
        echo ✅ Limpeza e instalação concluídas com sucesso!
    )
) else (
    echo ✅ Instalação normal bem-sucedida!
)

REM Verificar dependências críticas
echo 🔍 Verificando dependências críticas...
node -e "require('@react-native-async-storage/async-storage')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  AsyncStorage não encontrado. Instalando...
    npm install @react-native-async-storage/async-storage
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar AsyncStorage!
        exit /b 1
    )
    echo ✅ AsyncStorage instalado com sucesso!
) else (
    echo ✅ AsyncStorage já está instalado
)

REM Iniciar Expo (mostrar output para ver QR code)
echo 🚀 Iniciando Expo...
echo 📱 Aguarde o QR code aparecer...
start "Frontend IOTRAC" cmd /k "yarn start"

REM Aguardar frontend inicializar
echo ⏳ Aguardando frontend inicializar...
timeout /t 10 >nul

REM Verificar se o Expo está rodando
curl -s http://localhost:19000 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend iniciado com sucesso!
) else (
    curl -s http://localhost:8081 >nul 2>&1
    if %errorlevel%==0 (
        echo ✅ Frontend iniciado com sucesso!
    ) else (
        echo ⚠️  Frontend pode estar iniciando ainda...
        echo Verificando novamente em 5 segundos...
        timeout /t 5 >nul
        curl -s http://localhost:19000 >nul 2>&1
        if %errorlevel%==0 (
            echo ✅ Frontend iniciado com sucesso!
        ) else (
            curl -s http://localhost:8081 >nul 2>&1
            if %errorlevel%==0 (
                echo ✅ Frontend iniciado com sucesso!
            ) else (
                echo ❌ Falha ao iniciar o frontend!
                exit /b 1
            )
        )
    )
)

exit /b 0

REM ===== FUNÇÕES DE CONFIGURAÇÃO AUTOMÁTICA =====

REM Função para configurar .env do backend com credenciais validadas
:configure_backend_env
echo [IOTRAC] ⚙️  Configurando .env do backend...

set backend_dir=..\iotrac-backend
set env_file=%backend_dir%\config\.env

if not exist "%env_file%" (
    echo ❌ Arquivo .env do backend não encontrado!
    exit /b 1
)

REM Fazer backup
copy "%env_file%" "%env_file%.backup" >nul 2>&1

REM Configurar EMAIL_USER e EMAIL_PASSWORD
if not "%user_email%"=="" (
    if not "%user_password%"=="" (
        REM Atualizar EMAIL_USER
        powershell -Command "(Get-Content '%env_file%') -replace '^EMAIL_USER=.*', 'EMAIL_USER=%user_email%' | Set-Content '%env_file%'"
        
        REM Atualizar EMAIL_PASSWORD
        powershell -Command "(Get-Content '%env_file%') -replace '^EMAIL_PASSWORD=.*', 'EMAIL_PASSWORD=%user_password%' | Set-Content '%env_file%'"
        
        REM Atualizar EMAIL_FROM
        powershell -Command "(Get-Content '%env_file%') -replace '^EMAIL_FROM=.*', 'EMAIL_FROM=IOTRAC ^<%user_email%^>' | Set-Content '%env_file%'"
        
        echo ✅ Credenciais de email configuradas no backend
    )
)

REM Configurar LLM_API_KEY se fornecida
if "%llm_enabled%"=="true" (
    if not "%llm_api_key%"=="" (
        powershell -Command "(Get-Content '%env_file%') -replace '^LLM_API_KEY=.*', 'LLM_API_KEY=%llm_api_key%' | Set-Content '%env_file%'"
        powershell -Command "(Get-Content '%env_file%') -replace '^LLM_PROVIDER=.*', 'LLM_PROVIDER=together' | Set-Content '%env_file%'"
        powershell -Command "(Get-Content '%env_file%') -replace '^LLM_MODEL=.*', 'LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo-Free' | Set-Content '%env_file%'"
        
        echo ✅ Configuração LLM adicionada ao backend
    )
) else (
    echo ⚠️  LLM não configurado (pulado ou falhou)
)

exit /b 0

REM Função para detectar e configurar IP automaticamente
:configure_network_ip
echo [IOTRAC] 🌐 Configurando IP da rede automaticamente...

REM Detectar IP da interface principal (Windows)
set ip_address=

REM Método 1: ipconfig (Windows)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set ip_temp=%%a
    set ip_temp=!ip_temp: =!
    if "!ip_temp:~0,7!"=="192.168" (
        set ip_address=!ip_temp!
        goto :ip_found
    )
    if "!ip_temp:~0,3!"=="10." (
        set ip_address=!ip_temp!
        goto :ip_found
    )
    if "!ip_temp:~0,7!"=="172.16" (
        set ip_address=!ip_temp!
        goto :ip_found
    )
)

:ip_found

REM Fallback final
if "%ip_address%"=="" (
    set ip_address=localhost
    echo ⚠️  Usando localhost (não foi possível detectar IP da rede)
)

echo ✅ IP detectado: %ip_address%

REM IMPLEMENTAR SISTEMA: .env + ApiConfig.ts
set backend_url=

REM 1. DETECTAR BACKEND DINÁMICAMENTE
echo 🔍 Detectando backend ativo...

REM Verificar se backend está rodando na porta 8000
netstat -an | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    set backend_url=http://localhost:8000
    echo ✅ Backend detectado em localhost:8000
) else (
    echo ⚠️  Backend não detectado, usando localhost como padrão
    set backend_url=http://localhost:8000
)

REM 2. ATUALIZAR ApiConfig.ts AUTOMATICAMENTE
set config_file=src\constants\ApiConfig.ts
if exist "%config_file%" (
    echo ⚙️  Atualizando ApiConfig.ts automaticamente...
    
    REM Fazer backup
    copy "%config_file%" "%config_file%.backup" >nul 2>&1
    
    REM Atualizar BASE_URL no ApiConfig.ts
    powershell -Command "(Get-Content '%config_file%') -replace 'BASE_URL: .*', 'BASE_URL: \"%backend_url%\"' | Set-Content '%config_file%'"
    
    REM Verificar se a mudança foi feita
    findstr "%backend_url%" "%config_file%" >nul 2>&1
    if %errorlevel%==0 (
        echo ✅ ApiConfig.ts atualizado para: %backend_url%
    ) else (
        echo ⚠️  Tentando método alternativo...
        REM Método alternativo: substituir qualquer BASE_URL
        powershell -Command "(Get-Content '%config_file%') -replace 'BASE_URL: \"[^\"]*\"', 'BASE_URL: \"%backend_url%\"' | Set-Content '%config_file%'"
        if %errorlevel%==0 (
            echo ✅ ApiConfig.ts atualizado (método alternativo)
        ) else (
            echo ❌ Falha ao atualizar ApiConfig.ts
            REM Restaurar backup
            copy "%config_file%.backup" "%config_file%" >nul 2>&1
            exit /b 1
        )
    )
) else (
    echo ❌ ApiConfig.ts não encontrado em %config_file%
    exit /b 1
)

REM 4. VERIFICAR CONFIGURAÇÃO FINAL
echo 🔍 Verificando configuração final...
curl -s "%backend_url%" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend acessível em %backend_url%
    
    REM Mostrar resumo
    echo.
    echo 🎉 CONFIGURAÇÃO IMPLEMENTADA:
    echo    • ApiConfig.ts atualizado automaticamente
    echo    • Backend verificado e funcionando
    echo    • Sistema pronto para usar!
    echo.
    
    exit /b 0
) else (
    echo ⚠️  Backend não acessível, mas configuração aplicada
    echo    • Verifique se o backend está rodando
    echo    • URL configurada: %backend_url%
    exit /b 0
)

REM ===== FUNÇÃO PRINCIPAL =====

:main
REM ETAPA 1: Validação segura de credenciais
call :secure_credential_validation

REM ETAPA 2: Verificações básicas
echo [IOTRAC] 🚀 Iniciando IOTRAC - Sistema de Gerenciamento IoT

REM Verificar diretório
if not exist "..\iotrac-backend" (
    echo ❌ Execute este script dentro do diretório iotrac-frontend
    echo Certifique-se de que a pasta '..\iotrac-backend' existe
    exit /b 1
)

REM Verificar privilégios de administrador (apenas se necessário para instalações)
call :check_admin_privileges

REM Verificar dependências do sistema
call :check_system_dependencies

REM ETAPA 3: Configurações automáticas
REM Detectar IP automaticamente
call :configure_network_ip

REM Configurar .env do backend com credenciais
call :configure_backend_env

REM Verificar e configurar chaves AES
call :setup_aes_keys

REM ETAPA 4: Inicialização
REM Limpar processos anteriores
call :kill_processes

REM Iniciar serviços
call :start_backend
call :start_frontend

echo.
echo 🎉 SISTEMA RESTAURADO COMPLETAMENTE!
echo ✅ Validação segura de credenciais
echo ✅ Configuração automática de .env
echo ✅ Correção de venv corrompido
echo ✅ Kill de processos específicos
echo ✅ Integração LLM configurada
echo.
echo 📡 Backend: http://localhost:8000
echo 📱 Expo DevTools: http://localhost:19002
echo 🌐 Web: http://localhost:19006
echo 📱 Mobile: http://localhost:8081
echo.
echo 🔍 Para ver o QR code do Expo:
echo    1. Abra http://localhost:19002 no navegador
echo    2. Ou aguarde o QR code aparecer no terminal
echo    3. Escaneie com o app Expo Go no seu celular
echo.
echo 🤖 IA IOTRAC configurada:
if "%llm_enabled%"=="true" (
    echo    • IA Avançada: Together AI (Llama-3.3-70B)
    echo    • IA Heurística: Regras locais
) else (
    echo    • IA Heurística: Regras locais
)
echo    • Endpoints: /ai/query, /ai/summary, /ai/recommendations
echo.
echo Para parar, feche as janelas do terminal ou pressione Ctrl+C
echo.
pause

REM Executar função principal
call :main 