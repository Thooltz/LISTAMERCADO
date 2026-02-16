# 🔍 Diagnóstico e Correção: ERR_NAME_NOT_RESOLVED - Firebase Auth

## 📋 Diagnóstico Rápido

O erro `ERR_NAME_NOT_RESOLVED` para `identitytoolkit.googleapis.com` é **100% problema de DNS/rede**, não de código.

**Diferença importante:**
- ❌ **DNS Error** (`ERR_NAME_NOT_RESOLVED`): Não consegue resolver o nome do domínio
- ✅ **API Error** (401/403): Consegue conectar, mas credenciais inválidas

Seu caso é **DNS Error** → problema de rede.

---

## 🚀 Solução Rápida (5 minutos)

### Passo 1: Flush DNS do Windows
```cmd
# Abra CMD como Administrador e execute:
ipconfig /flushdns
```

### Passo 2: Trocar DNS para Google
1. Abra **Configurações do Windows** → **Rede e Internet** → **Wi-Fi** (ou **Ethernet**)
2. Clique no nome da sua conexão
3. Role até **Configurações de IP** → **Editar**
4. Mude de **Automático (DHCP)** para **Manual**
5. Configure:
   - **DNS preferencial:** `8.8.8.8`
   - **DNS alternativo:** `8.8.4.4`
6. Salve e reinicie o navegador

### Passo 3: Testar
Abra no navegador: `https://identitytoolkit.googleapis.com`

Se abrir (mesmo que mostre erro 404/400), o DNS está funcionando! ✅

---

## 🔧 Diagnóstico Completo

### Teste 1: Verificar Resolução DNS

**CMD (como Administrador):**
```cmd
nslookup identitytoolkit.googleapis.com
```

**Resultado esperado:**
```
Nome:    identitytoolkit.googleapis.com
Addresses:  142.250.191.14
           2607:f8b0:4004:c1b::e
```

**Se der erro:**
```
*** Não foi possível encontrar identitytoolkit.googleapis.com: Non-existent domain
```
→ **Problema confirmado: DNS não está resolvendo**

---

### Teste 2: Ping (testar conectividade)

**CMD:**
```cmd
ping identitytoolkit.googleapis.com
```

**Resultado esperado:**
```
Fazendo ping em identitytoolkit.googleapis.com [142.250.191.14] com 32 bytes de dados:
Resposta de 142.250.191.14: bytes=32 tempo=45ms TTL=118
```

**Se der erro:**
```
Ping request could not find host identitytoolkit.googleapis.com
```
→ **DNS não está funcionando**

---

### Teste 3: Testar DNS específico

**CMD:**
```cmd
# Testar com DNS do Google
nslookup identitytoolkit.googleapis.com 8.8.8.8

# Testar com DNS da Cloudflare
nslookup identitytoolkit.googleapis.com 1.1.1.1
```

**Se funcionar com 8.8.8.8 mas não com seu DNS atual:**
→ **Seu DNS está com problema** → Troque para 8.8.8.8

---

### Teste 4: Testar via Navegador

Abra no Chrome:
```
https://identitytoolkit.googleapis.com
```

**Resultados possíveis:**
- ✅ **Abre (mesmo com erro 400/404)**: DNS OK, problema pode ser no código
- ❌ **ERR_NAME_NOT_RESOLVED**: DNS não está funcionando
- ❌ **Timeout**: Firewall/proxy bloqueando

---

### Teste 5: Testar via PowerShell (fetch)

**PowerShell:**
```powershell
# Teste simples de conectividade
Invoke-WebRequest -Uri "https://identitytoolkit.googleapis.com" -Method GET -UseBasicParsing
```

**Resultado esperado:**
```
StatusCode        : 400
StatusDescription : Bad Request
```

**Se der erro:**
```
Invoke-WebRequest: Não é possível resolver o nome remoto 'identitytoolkit.googleapis.com'
```
→ **DNS não está funcionando**

---

## 🛠️ Soluções por Ordem de Prioridade

### Solução 1: Trocar DNS (RECOMENDADO)

**Via Interface Gráfica (Windows 10/11):**

1. **Wi-Fi:**
   - Clique no ícone de Wi-Fi na barra de tarefas
   - Clique em **Propriedades** da sua rede
   - Role até **Configurações de IP**
   - Clique em **Editar**
   - Selecione **Manual**
   - Ative **IPv4**
   - Preencha:
     - **DNS preferencial:** `8.8.8.8`
     - **DNS alternativo:** `8.8.4.4`
   - Salve

2. **Ethernet (Cabo):**
   - Configurações → Rede e Internet → Ethernet
   - Clique no nome da conexão
   - Mesmo processo acima

**Via PowerShell (Administrador):**
```powershell
# Ver interfaces de rede
Get-NetAdapter

# Trocar DNS (substitua "Wi-Fi" pelo nome da sua interface)
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses "8.8.8.8","8.8.4.4"
```

**Via CMD (Administrador):**
```cmd
# Listar interfaces
netsh interface show interface

# Trocar DNS (substitua "Wi-Fi" pelo nome da sua interface)
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2
```

---

### Solução 2: Flush DNS + Reset de Rede

**CMD (Administrador):**
```cmd
# 1. Flush DNS
ipconfig /flushdns

# 2. Renovar IP
ipconfig /release
ipconfig /renew

# 3. Reset completo (opcional, mais agressivo)
netsh winsock reset
netsh int ip reset
```

**Depois, reinicie o computador.**

---

### Solução 3: Verificar Bloqueios

#### AdGuard / uBlock Origin
- Desative temporariamente as extensões
- Teste novamente

#### Antivírus / Firewall
- Adicione exceção para `*.googleapis.com`
- Ou desative temporariamente para testar

#### Roteador / Provedor
- Acesse o painel do roteador (geralmente `192.168.1.1`)
- Verifique se há bloqueio de DNS ou filtros ativos
- Teste com hotspot 4G do celular (bypass do roteador)

---

### Solução 4: Usar DNS Alternativo

**Opções de DNS públicos:**

| Provedor | DNS Primário | DNS Secundário |
|----------|--------------|----------------|
| Google   | 8.8.8.8      | 8.8.4.4        |
| Cloudflare | 1.1.1.1    | 1.0.0.1        |
| OpenDNS  | 208.67.222.222 | 208.67.220.220 |
| Quad9   | 9.9.9.9      | 149.112.112.112 |

**Recomendação:** Use **Google (8.8.8.8)** ou **Cloudflare (1.1.1.1)**

---

## ✅ Checklist de Validação Final

Execute na ordem:

### 1. Teste DNS
```cmd
nslookup identitytoolkit.googleapis.com
```
✅ Deve retornar IPs (142.250.191.14 ou similar)

### 2. Teste Navegador
Abra: `https://identitytoolkit.googleapis.com`
✅ Deve abrir (mesmo com erro 400/404, não ERR_NAME_NOT_RESOLVED)

### 3. Teste Ping
```cmd
ping identitytoolkit.googleapis.com
```
✅ Deve responder com tempo < 100ms

### 4. Teste Firebase Auth
- Tente criar conta no seu app
- Tente fazer login
✅ Deve funcionar sem ERR_NAME_NOT_RESOLVED

### 5. Teste em Rede Diferente (Opcional)
- Conecte no hotspot 4G do celular
- Teste novamente
✅ Se funcionar no 4G mas não no Wi-Fi → problema no roteador/provedor

---

## 🎯 Diagnóstico Provável

Com base no erro `ERR_NAME_NOT_RESOLVED`:

1. **Mais provável (80%):** DNS do provedor/roteador está com problema
   - **Solução:** Trocar para 8.8.8.8

2. **Provável (15%):** Cache DNS corrompido
   - **Solução:** `ipconfig /flushdns` + reiniciar navegador

3. **Menos provável (5%):** Bloqueio por antivírus/firewall
   - **Solução:** Adicionar exceção ou desativar temporariamente

---

## 🚨 Solução Mais Rápida (2 minutos)

```cmd
# 1. Abra CMD como Administrador
# 2. Execute:
ipconfig /flushdns

# 3. Troque DNS via interface gráfica para 8.8.8.8 / 8.8.4.4
# 4. Reinicie o Chrome
# 5. Teste: https://identitytoolkit.googleapis.com
```

---

## 📝 Notas Importantes

### Por que a API Key não é o problema?
- Se fosse problema de API Key, você veria erro **401 (Unauthorized)** ou **403 (Forbidden)**
- `ERR_NAME_NOT_RESOLVED` significa que o Windows **não consegue nem encontrar o servidor**
- É como tentar ligar para um número que não existe vs. ligar e receber "ocupado"

### Por que funciona em outras páginas?
- Outras páginas podem usar CDNs diferentes ou já estar em cache
- Firebase Auth usa `identitytoolkit.googleapis.com` especificamente
- Pode ser que seu DNS bloqueie apenas domínios `.googleapis.com`

### Teste em Rede Diferente
Se funcionar no hotspot 4G mas não no Wi-Fi:
- Problema está no **roteador** ou **provedor de internet**
- Solução definitiva: Trocar DNS no roteador OU usar VPN

---

## 🔄 Comandos de Referência Rápida

```cmd
# Flush DNS
ipconfig /flushdns

# Ver DNS atual
ipconfig /all | findstr "DNS"

# Testar resolução
nslookup identitytoolkit.googleapis.com

# Testar com DNS específico
nslookup identitytoolkit.googleapis.com 8.8.8.8

# Ping
ping identitytoolkit.googleapis.com

# Ver interfaces de rede
netsh interface show interface

# Trocar DNS (substitua "Wi-Fi")
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2
```

---

## ✅ Validação Final

Após aplicar as correções, confirme:

- [ ] `nslookup identitytoolkit.googleapis.com` retorna IPs
- [ ] `https://identitytoolkit.googleapis.com` abre no navegador
- [ ] App consegue criar usuário sem ERR_NAME_NOT_RESOLVED
- [ ] App consegue fazer login sem ERR_NAME_NOT_RESOLVED

**Se todos os itens estiverem ✅, problema resolvido!**

---

**Última dica:** Se nada funcionar, teste com **VPN** ou **hotspot 4G** para confirmar se é bloqueio do provedor.
