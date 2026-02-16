@echo off
echo ========================================
echo Teste de Conectividade Firebase Auth
echo ========================================
echo.

echo [1/4] Testando resolucao DNS...
nslookup identitytoolkit.googleapis.com
if %errorlevel% equ 0 (
    echo [OK] DNS funcionando
) else (
    echo [ERRO] DNS nao esta funcionando
)
echo.

echo [2/4] Testando ping...
ping -n 2 identitytoolkit.googleapis.com
if %errorlevel% equ 0 (
    echo [OK] Ping funcionando
) else (
    echo [ERRO] Ping falhou
)
echo.

echo [3/4] Testando com DNS do Google (8.8.8.8)...
nslookup identitytoolkit.googleapis.com 8.8.8.8
if %errorlevel% equ 0 (
    echo [OK] DNS do Google funciona - Recomendado trocar seu DNS
) else (
    echo [ERRO] Mesmo DNS do Google nao funcionou
)
echo.

echo [4/4] Verificando DNS atual...
ipconfig /all | findstr /i "dns"
echo.

echo ========================================
echo Teste concluido!
echo ========================================
echo.
echo Proximos passos:
echo 1. Execute como Administrador: ipconfig /flushdns
echo 2. Troque DNS para 8.8.8.8 / 8.8.4.4
echo 3. Reinicie o navegador
echo.
pause
