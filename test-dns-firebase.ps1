# Script PowerShell para testar conectividade Firebase Auth
# Execute: powershell -ExecutionPolicy Bypass -File test-dns-firebase.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Teste de Conectividade Firebase Auth" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Resolução DNS
Write-Host "[1/5] Testando resolução DNS..." -ForegroundColor Yellow
try {
    $result = Resolve-DnsName -Name "identitytoolkit.googleapis.com" -ErrorAction Stop
    Write-Host "✅ DNS OK - IP encontrado: $($result[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "❌ DNS FALHOU - Não conseguiu resolver o domínio" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 2: Ping
Write-Host "[2/5] Testando ping..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "identitytoolkit.googleapis.com" -Count 2 -ErrorAction Stop
    Write-Host "✅ Ping OK - Tempo médio: $($ping.ResponseTime)ms" -ForegroundColor Green
} catch {
    Write-Host "❌ Ping FALHOU - Não conseguiu conectar" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 3: HTTP Request
Write-Host "[3/5] Testando requisição HTTP..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://identitytoolkit.googleapis.com" -Method GET -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTP OK - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*não é possível resolver*" -or $_.Exception.Message -like "*could not resolve*") {
        Write-Host "❌ HTTP FALHOU - Erro de DNS (ERR_NAME_NOT_RESOLVED)" -ForegroundColor Red
    } else {
        Write-Host "⚠️  HTTP respondeu - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host "   (Isso é normal, significa que o DNS está funcionando)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Teste 4: DNS atual
Write-Host "[4/5] Verificando DNS atual..." -ForegroundColor Yellow
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
foreach ($adapter in $adapters) {
    $dns = Get-DnsClientServerAddress -InterfaceAlias $adapter.Name -AddressFamily IPv4 -ErrorAction SilentlyContinue
    if ($dns.ServerAddresses) {
        Write-Host "   Interface: $($adapter.Name)" -ForegroundColor Cyan
        Write-Host "   DNS: $($dns.ServerAddresses -join ', ')" -ForegroundColor Cyan
        if ($dns.ServerAddresses -contains "8.8.8.8" -or $dns.ServerAddresses -contains "1.1.1.1") {
            Write-Host "   ✅ Usando DNS público (recomendado)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Usando DNS do provedor (pode causar problemas)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Teste 5: Teste com DNS do Google
Write-Host "[5/5] Testando com DNS do Google (8.8.8.8)..." -ForegroundColor Yellow
try {
    $result = Resolve-DnsName -Name "identitytoolkit.googleapis.com" -Server "8.8.8.8" -ErrorAction Stop
    Write-Host "✅ DNS do Google funciona - IP: $($result[0].IPAddress)" -ForegroundColor Green
    Write-Host "   💡 Recomendação: Troque seu DNS para 8.8.8.8" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Mesmo com DNS do Google não funcionou" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Teste concluído!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Se DNS falhou: Execute 'ipconfig /flushdns' como Administrador" -ForegroundColor White
Write-Host "2. Troque DNS para 8.8.8.8 / 8.8.4.4 nas configurações de rede" -ForegroundColor White
Write-Host "3. Reinicie o navegador e teste novamente" -ForegroundColor White
Write-Host ""
