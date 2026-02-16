# ✅ Checklist de Deploy - Vercel

## 🔧 Correções Aplicadas

### Arquivos Criados/Modificados:

1. **✅ vercel.json** (NOVO)
   - SPA routing configurado
   - Output directory: `dist`
   - Cache headers para assets

2. **✅ vite.config.ts** (ATUALIZADO)
   - Removida referência ao Supabase
   - Atualizado para Firebase no PWA

3. **✅ CORRECOES_DEPLOY.md** (NOVO)
   - Documentação completa das correções

---

## 📋 Passo a Passo de Deploy

### 1. Teste Local (OBRIGATÓRIO)

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Preview
npm run preview
```

**Validações:**
- [ ] Build completa sem erros
- [ ] Preview abre em `http://localhost:4173`
- [ ] App carrega (sem tela branca)
- [ ] Console sem erros (F12)
- [ ] Rotas funcionam (`/`, `/auth`, `/lists`)

---

### 2. Commit e Push

```bash
git add .
git commit -m "fix: configuração de deploy Vercel + correção PWA"
git push
```

---

### 3. Configuração Vercel (Dashboard)

#### Build Settings:
- **Framework Preset:** `Vite` (ou deixar vazio)
- **Build Command:** `npm run build` (ou deixar vazio, usa vercel.json)
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** `18.x` ou `20.x` (padrão)

#### Environment Variables:
- ❌ **NÃO precisa** (Firebase config está hardcoded)
- Se quiser usar env vars no futuro, adicione:
  - `VITE_FIREBASE_API_KEY` (opcional)
  - `VITE_FIREBASE_PROJECT_ID` (opcional)

---

### 4. Aguardar Deploy

- Vercel faz deploy automático após push
- Aguarde build completar
- Verifique se status é "Ready" (verde)

---

### 5. Validação Pós-Deploy

#### A) Site Abre?
- [ ] Site abre sem tela branca
- [ ] Console sem erros (F12 → Console)

#### B) Rotas Funcionam?
- [ ] `/` → Landing page
- [ ] `/auth` → Página de login (acesso direto)
- [ ] `/lists` → Redireciona para `/auth` se não logado

#### C) Autenticação Funciona?
- [ ] Criar conta funciona
- [ ] Login funciona
- [ ] Logout funciona

#### D) Firestore Funciona?
- [ ] Lista carrega itens após login
- [ ] Adicionar item funciona
- [ ] Marcar/desmarcar checkbox funciona
- [ ] Remover item funciona

---

## 🚨 Se o Deploy Falhar

### Erro no Build?

1. **Copie o log completo:**
   - Vercel → Deployments → Clique no deploy falhado
   - Copie TODO o "Build Logs"

2. **Envie para diagnóstico:**
   - Cole o log completo
   - Vou identificar a linha exata do erro

### Erro em Runtime (Site sobe mas quebra)?

1. **Abra o site deployado**
2. **F12 → Console:**
   - Copie TODOS os erros (vermelho)
3. **F12 → Network:**
   - Recarregue a página
   - Veja requisições falhando (vermelho)
4. **Envie para diagnóstico:**
   - Erros do console
   - Screenshot (se tela branca)
   - Network tab (requisições falhando)

---

## 🔍 Problemas Comuns e Soluções

### ❌ "Cannot find module 'firebase'"
**Causa:** Firebase não está em dependencies  
**Solução:** ✅ Já corrigido (firebase está em dependencies)

### ❌ "Module not found: Can't resolve '../../../firebase'"
**Causa:** Case-sensitive no Linux (Vercel)  
**Solução:** ✅ Verificado (arquivo é `firebase.ts` minúsculo)

### ❌ "404 ao acessar /auth diretamente"
**Causa:** SPA routing não configurado  
**Solução:** ✅ vercel.json criado com rewrites

### ❌ "window is not defined"
**Causa:** Firebase tentando rodar no servidor  
**Solução:** ✅ Verificado (firebase.ts não usa window no topo)

### ❌ "Build succeeded but app shows blank page"
**Causa:** Erro de runtime não capturado  
**Solução:** 
1. F12 → Console (ver erros)
2. F12 → Network (ver recursos não carregando)
3. Enviar logs para diagnóstico

---

## 📊 Status das Correções

| Item | Status | Observação |
|------|--------|------------|
| vercel.json criado | ✅ | SPA routing configurado |
| vite.config.ts atualizado | ✅ | Removido Supabase, atualizado Firebase |
| Firebase em dependencies | ✅ | Versão 10.14.1 |
| Imports case-sensitive | ✅ | Todos verificados |
| SSR issues | ✅ | Firebase só roda no client |
| Build command | ✅ | `npm run build` |
| Output directory | ✅ | `dist` |

---

## 🎯 Próximos Passos

1. ✅ **Teste local:** `npm run build && npm run preview`
2. ✅ **Commit:** `git add . && git commit -m "fix: deploy" && git push`
3. ⏳ **Aguardar deploy** na Vercel
4. ⏳ **Validar** checklist acima
5. ⏳ **Se falhar:** Enviar logs completos

---

## 📞 Informações para Diagnóstico

Se ainda falhar, preciso de:

1. **Log completo do build** (Vercel → Build Logs)
2. **Erros do console** (F12 → Console no site deployado)
3. **Network tab** (F12 → Network, requisições falhando)
4. **Screenshot** (se tela branca)

Com essas informações, consigo identificar o problema exato e corrigir.
