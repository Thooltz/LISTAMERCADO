# ✅ Checklist de Verificação: Erro PGRST205

## 📋 Causa Raiz do Erro

### O que é PGRST205?
O erro `PGRST205` significa que o **PostgREST** (API REST do Supabase) não consegue encontrar a tabela `public.lists` no seu **schema cache interno**.

### Por que acontece?
1. **Tabela não existe** (95% dos casos)
   - A tabela `lists` nunca foi criada no banco de dados
   - O SQL do `database.sql` não foi executado

2. **Cache desatualizado** (4% dos casos)
   - Tabela existe mas PostgREST ainda não viu
   - Requer reload do schema cache

3. **Schema incorreto** (1% dos casos)
   - Tabela criada em schema diferente de `public`
   - Nome da tabela com case sensitivity incorreto

---

## 🔍 Checklist de Verificação no Supabase Dashboard

### ✅ Passo 1: Verificar se a tabela existe

1. Acesse: **Supabase Dashboard** → Seu Projeto
2. Vá em: **Table Editor** (menu lateral esquerdo)
3. Verifique:
   - [ ] A tabela `lists` aparece na lista de tabelas?
   - [ ] Está no schema `public` (não `auth` ou outro)?
   - [ ] Tem as colunas corretas:
     - `id` (UUID, Primary Key)
     - `user_id` (UUID, Foreign Key → auth.users)
     - `title` (TEXT)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)

**Se NÃO aparecer:** → Execute o `database.sql` completo

**Se aparecer mas ainda dá erro:** → Veja Passo 4 (Cache)

---

### ✅ Passo 2: Verificar RLS e Policies

1. Vá em: **Authentication** → **Policies** (ou **Table Editor** → `lists` → **Policies**)
2. Selecione a tabela `lists` no dropdown
3. Verifique:
   - [ ] **RLS está ENABLED** (ativado)?
   - [ ] Existem **4 policies** criadas:
     - `Users can view own lists` (SELECT) - `auth.uid() = user_id`
     - `Users can create own lists` (INSERT) - `auth.uid() = user_id`
     - `Users can update own lists` (UPDATE) - `auth.uid() = user_id`
     - `Users can delete own lists` (DELETE) - `auth.uid() = user_id`

**Se faltar policies ou RLS estiver desabilitado:** → Execute o `database.sql` completo

---

### ✅ Passo 3: Verificar Schema via SQL

1. Vá em: **SQL Editor**
2. Execute:
```sql
SELECT 
  table_schema, 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'lists';
```
3. Resultado esperado:
   - `table_schema` = `public`
   - `table_name` = `lists`
   - `table_type` = `BASE TABLE`

**Se estiver em outro schema:** → Problema! Tabela deve estar em `public`

**Se não retornar nada:** → Tabela não existe → Execute `database.sql`

---

### ✅ Passo 4: Verificar Permissões da Tabela

1. No **SQL Editor**, execute:
```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'lists';
```
2. Verifique:
   - [ ] `rls_enabled` = `true` (RLS está ativado)

---

### ✅ Passo 5: Verificar Policies via SQL

1. No **SQL Editor**, execute:
```sql
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'lists'
ORDER BY cmd;
```
2. Verifique:
   - [ ] Existem 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - [ ] Todas usam `auth.uid() = user_id`

---

### ✅ Passo 6: Recarregar Schema Cache do PostgREST

**Se a tabela existe mas ainda dá erro PGRST205:**

#### Opção A: Via SQL (Recomendado)
1. No **SQL Editor**, execute:
```sql
NOTIFY pgrst, 'reload schema';
```
2. Aguarde **30 segundos**
3. Recarregue a página do frontend

#### Opção B: Via Dashboard
1. Vá em: **Settings** → **API**
2. Procure por: **"Reload Schema Cache"** ou **"Refresh Schema"**
3. Clique para recarregar

#### Opção C: Aguardar (Automático)
- O cache atualiza automaticamente a cada **1-2 minutos**
- Aguarde e tente novamente

---

### ✅ Passo 7: Testar Acesso via SQL Editor

1. No **SQL Editor**, execute:
```sql
-- Teste SELECT (deve funcionar mesmo sem estar logado, mas retornar vazio)
SELECT * FROM public.lists LIMIT 1;

-- Teste INSERT (precisa estar logado)
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do seu usuário
INSERT INTO public.lists (title, user_id) 
VALUES ('Teste', 'SEU_USER_ID_AQUI')
RETURNING *;
```

**Se der erro de permissão:** → Policies RLS estão bloqueando (verifique Passo 2)

**Se der erro de tabela não existe:** → Execute `database.sql`

---

### ✅ Passo 8: Verificar Logs da API

1. Vá em: **Logs** → **API Logs**
2. Filtre por: `lists` ou `PGRST205`
3. Verifique:
   - [ ] Há erros relacionados a `lists`?
   - [ ] Qual é o código de erro exato?
   - [ ] Há problemas de autenticação?

---

## 🎯 Resumo do Checklist

Execute este checklist na ordem:

- [ ] **Passo 1:** Tabela `lists` existe no Table Editor?
- [ ] **Passo 2:** RLS está ENABLED e tem 4 policies?
- [ ] **Passo 3:** Tabela está no schema `public`?
- [ ] **Passo 4:** RLS está realmente ativado (via SQL)?
- [ ] **Passo 5:** Policies estão corretas (via SQL)?
- [ ] **Passo 6:** Schema cache foi recarregado?
- [ ] **Passo 7:** Teste SQL funciona?
- [ ] **Passo 8:** Logs mostram algum erro?

---

## 🚨 Se Algo Falhar

### Tabela não existe:
→ Execute o `database.sql` completo no SQL Editor

### RLS/Policies faltando:
→ Execute o `database.sql` completo (ele recria tudo)

### Cache desatualizado:
→ Execute: `NOTIFY pgrst, 'reload schema';` e aguarde 30s

### Erro persiste:
→ Verifique os logs da API e entre em contato com suporte do Supabase

---

## ✅ Resultado Esperado

Após seguir todos os passos:
- ✅ Tabela `lists` existe em `public`
- ✅ RLS ativado com 4 policies corretas
- ✅ Schema cache recarregado
- ✅ GET `/rest/v1/lists` retorna 200 (ou array vazio)
- ✅ POST `/rest/v1/lists` retorna 201 (criação bem-sucedida)
- ✅ Erro PGRST205 desaparece completamente
