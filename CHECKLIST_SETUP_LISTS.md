# ✅ CHECKLIST: Setup Tabela Lists

## 📋 Passo a Passo

### 1️⃣ Executar SQL no Supabase
- [ ] Abrir Supabase Dashboard → SQL Editor
- [ ] Copiar todo o conteúdo de `setup_lists_completo.sql`
- [ ] Colar no SQL Editor
- [ ] Clicar em "Run" ou pressionar `Ctrl+Enter`
- [ ] Verificar mensagem de sucesso (sem erros)

### 2️⃣ Verificar Tabela Criada
- [ ] Ir em **Table Editor** (menu lateral)
- [ ] Verificar que a tabela `lists` aparece na lista
- [ ] Clicar em `lists` para ver as colunas:
  - ✅ `id` (uuid, primary key)
  - ✅ `user_id` (uuid, foreign key)
  - ✅ `title` (text)
  - ✅ `items` (jsonb)
  - ✅ `created_at` (timestamptz)
  - ✅ `updated_at` (timestamptz)

### 3️⃣ Verificar RLS Ativado
- [ ] Na tabela `lists` → aba **Policies**
- [ ] Verificar que **RLS está ENABLED** (toggle verde)
- [ ] Verificar 4 policies criadas:
  - ✅ "Users can view their own lists" (SELECT)
  - ✅ "Users can insert their own lists" (INSERT)
  - ✅ "Users can update their own lists" (UPDATE)
  - ✅ "Users can delete their own lists" (DELETE)

### 4️⃣ Verificar Schema Exposto
- [ ] Ir em **Settings** → **API**
- [ ] Na seção **Exposed schemas**, verificar que `public` está marcado
- [ ] Se não estiver, marcar e salvar

### 5️⃣ Verificar API Docs
- [ ] Ir em **API Docs** (menu lateral) ou acessar `/rest/v1/`
- [ ] Verificar que o endpoint `lists` aparece na lista
- [ ] Clicar em `lists` para ver os métodos disponíveis:
  - ✅ GET `/rest/v1/lists`
  - ✅ POST `/rest/v1/lists`
  - ✅ PATCH `/rest/v1/lists`
  - ✅ DELETE `/rest/v1/lists`

### 6️⃣ Testar no Frontend
- [ ] Fazer login na aplicação
- [ ] Verificar que não há mais erro 404 em `/rest/v1/lists`
- [ ] Testar criar uma lista
- [ ] Testar listar listas
- [ ] Testar atualizar uma lista
- [ ] Testar deletar uma lista

---

## 🔍 Como Verificar no Painel Supabase

### Table Editor → lists existe
1. Menu lateral → **Table Editor**
2. Procurar por `lists` na lista de tabelas
3. Clicar para ver estrutura completa

### Settings → API → Exposed schemas → public
1. Menu lateral → **Settings** (ícone de engrenagem)
2. Aba **API**
3. Seção **Exposed schemas**
4. Verificar checkbox `public` marcado

### API docs → endpoint lists aparece
1. Menu lateral → **API Docs** ou acessar `https://seu-projeto.supabase.co/rest/v1/`
2. Procurar por `lists` na lista de endpoints
3. Clicar para ver documentação completa do endpoint

---

## ⚠️ Troubleshooting

### Se ainda retornar 404:
1. Verificar se executou o comando `NOTIFY pgrst, 'reload schema'` no SQL
2. Aguardar 10-30 segundos (cache pode demorar)
3. Tentar executar novamente apenas: `NOTIFY pgrst, 'reload schema';`
4. Verificar logs do Supabase em **Logs** → **Postgres Logs**

### Se RLS bloquear acesso:
1. Verificar que está logado (`auth.uid()` não é null)
2. Verificar que as policies estão ativas (toggle verde)
3. Verificar que `user_id` na tabela corresponde ao `auth.uid()`
