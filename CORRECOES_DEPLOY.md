# 🔧 Correções de Deploy - Vercel/Netlify

## ✅ Correções Aplicadas

### 1. **vercel.json criado** (SPA Routing)
- ✅ Rewrite para todas as rotas → `/index.html`
- ✅ Output directory: `dist`
- ✅ Cache headers para assets

### 2. **vite.config.ts atualizado**
- ✅ Removida referência ao Supabase no PWA
- ✅ Atualizado para Firebase (`*.googleapis.com`)

### 3. **Verificações de Imports**
- ✅ Todos os imports usam caminhos relativos corretos
- ✅ Case-sensitive verificado (firebase.ts, AuthProvider.tsx)
- ✅ Firebase em `dependencies` (não em devDependencies)

---

## 📋 Checklist de Configuração Vercel

### No Dashboard da Vercel:

1. **Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build` (ou deixar vazio, usa vercel.json)
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Environment Variables:**
   - ❌ **NÃO precisa** de variáveis de ambiente (Firebase config está hardcoded)
   - Se quiser usar env vars no futuro, adicione:
     - `VITE_FIREBASE_API_KEY` (opcional)
     - `VITE_FIREBASE_PROJECT_ID` (opcional)

3. **Node Version:**
   - Deixe em `18.x` ou `20.x` (padrão da Vercel)

---

## 🧪 Testes Locais (ANTES do Deploy)

Execute na ordem:

```bash
# 1. Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# 2. Build local
npm run build

# 3. Preview local
npm run preview
```

**Validações:**
- [ ] Build completa sem erros
- [ ] Preview abre em `http://localhost:4173`
- [ ] App carrega sem tela branca
- [ ] Rotas funcionam (`/`, `/auth`, `/lists`)

---

## 🚨 Problemas Comuns e Soluções

### Erro: "Cannot find module 'firebase'"
**Causa:** Firebase não está em dependencies
**Solução:** Já corrigido ✅ (firebase está em dependencies)

### Erro: "Module not found: Can't resolve '../../../firebase'"
**Causa:** Case-sensitive no Linux (Vercel)
**Solução:** Verificar se arquivo é `firebase.ts` (minúsculo) ✅

### Erro: "404 ao acessar /auth diretamente"
**Causa:** SPA routing não configurado
**Solução:** ✅ vercel.json criado com rewrites

### Erro: "window is not defined" ou "localStorage is not defined"
**Causa:** Firebase tentando rodar no servidor (SSR)
**Solução:** Verificar se firebase.ts não usa window no topo ✅

### Erro: "Build succeeded but app shows blank page"
**Causa:** Erro de runtime não capturado
**Solução:** 
1. Abrir DevTools → Console
2. Verificar erros
3. Verificar Network tab (recursos não carregando)

---

## 📝 Logs que Preciso Ver

Para diagnóstico completo, envie:

1. **Build Logs (Vercel):**
   - Copie TODO o log do build (desde "Installing dependencies" até o final)
   - Procure por linhas com "ERROR" ou "Failed"

2. **Runtime Logs (Console do navegador):**
   - Abra o site deployado
   - F12 → Console
   - Copie TODOS os erros (vermelho)

3. **Network Tab:**
   - F12 → Network
   - Recarregue a página
   - Veja se há requisições falhando (vermelho)

---

## 🔍 Diagnóstico Baseado em Erros Comuns

### Se o erro for:
```
Error: Cannot find module './firebase' or its type definitions
```
→ **Causa:** Import path errado ou case-sensitive
→ **Solução:** Já verificado ✅

### Se o erro for:
```
Error: Failed to fetch dynamically imported module
```
→ **Causa:** Assets não encontrados (404)
→ **Solução:** Verificar base no vite.config.ts

### Se o erro for:
```
Error: Firebase: Error (auth/network-request-failed)
```
→ **Causa:** Problema de rede/DNS (não é problema de deploy)
→ **Solução:** Ver DIAGNOSTICO_DNS_FIREBASE.md

### Se o erro for:
```
Error: The requested module does not provide an export named 'auth'
```
→ **Causa:** Export errado no firebase.ts
→ **Solução:** Verificar exports ✅ (já está correto)

---

## ✅ Validação Final

Após deploy, confirme:

- [ ] Build passa na Vercel (sem erros)
- [ ] Site abre sem tela branca
- [ ] Console do navegador sem erros (F12)
- [ ] Rota `/` funciona
- [ ] Rota `/auth` funciona (acesso direto)
- [ ] Rota `/lists` funciona (após login)
- [ ] Login funciona (criar conta + entrar)
- [ ] Lista carrega itens do Firestore
- [ ] Adicionar item funciona
- [ ] Marcar/desmarcar checkbox funciona
- [ ] Remover item funciona

---

## 🚀 Próximos Passos

1. **Faça commit das mudanças:**
   ```bash
   git add vercel.json vite.config.ts
   git commit -m "fix: configuração de deploy Vercel + correção PWA"
   git push
   ```

2. **Aguarde deploy automático na Vercel**

3. **Teste o site deployado**

4. **Se ainda falhar:**
   - Envie os logs completos (build + runtime)
   - Vou diagnosticar o erro específico

---

## 📞 Informações Adicionais Necessárias

Se o deploy ainda falhar, preciso de:

1. **Log completo do build** (Vercel → Deployments → Build Logs)
2. **Erros do console** (F12 → Console no site deployado)
3. **Screenshot da tela branca** (se houver)
4. **Network tab** (F12 → Network, veja requisições falhando)

Com essas informações, consigo identificar o problema exato e corrigir.
