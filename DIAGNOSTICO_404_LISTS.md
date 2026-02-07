# 🔍 Diagnóstico e Solução - Erro 404 em /rest/v1/lists

**Projeto:** `fwpdpdtdwxgobpenwfes.supabase.co`  
**Erro:** `POST /rest/v1/lists?select=* -> 404 (Not Found)`

---

## 📊 DIAGNÓSTICO

### Por que 404 acontece (não é RLS)

**404 (Not Found)** no PostgREST significa:
- A tabela não existe no schema exposto
- O schema `public` não está exposto no PostgREST
- O schema cache do PostgREST não foi recarregado após criar a tabela
- Você está fazendo request no projeto errado

**NÃO é 404:**
- ❌ RLS bloqueando → retorna **401 (Unauthorized)** ou **403 (Forbidden)**
- ❌ Policy incorreta → retorna **403 (Forbidden)**
- ❌ Tabela existe mas sem permissão → retorna **403 (Forbidden)**

**É 404 quando:**
- ✅ Tabela não existe no database
- ✅ Schema `public` não está exposto
- ✅ Schema cache desatualizado (PostgREST não vê a tabela)
- ✅ Projeto errado na URL

---

## 🔎 SQL VERIFICAÇÃO

Execute este SQL no **SQL Editor** do Supabase para diagnosticar:

```sql
-- ============================================
-- DIAGNÓSTICO: Verificar tabela public.lists
-- ============================================

-- 1. Verificar database atual
SELECT current_database() AS database_atual;

-- 2. Verificar schema atual
SELECT current_schema() AS schema_atual;

-- 3. Verificar se a tabela public.lists existe
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'lists';

-- 4. Listar TODAS as tabelas do schema public
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. Verificar estrutura da tabela (se existir)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'lists'
ORDER BY ordinal_position;

-- 6. Verificar se RLS está habilitado (se tabela existir)
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_habilitado
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'lists';

-- 7. Verificar policies RLS (se tabela existir)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS comando,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'lists';

-- 8. Verificar se PostgREST tem acesso ao schema public
SELECT 
  nspname AS schema_name,
  nspowner::regrole AS owner
FROM pg_namespace
WHERE nspname = 'public';
```

**Interpretação dos resultados:**

- **Se `table_name = 'lists'` NÃO aparece:** Tabela não existe → precisa criar
- **Se aparece mas ainda dá 404:** Schema não exposto ou cache desatualizado
- **Se `rls_habilitado = false`:** RLS não está habilitado (mas isso não causa 404)

---

## 🔧 CORREÇÕES NO PAINEL

### Passo 1: Confirmar Projeto Correto

**No código (`.env` ou variáveis):**
```typescript
// Verifique se VITE_SUPABASE_URL corresponde ao projeto
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
// Deve ser: https://fwpdpdtdwxgobpenwfes.supabase.co
```

**No navegador (console):**
```javascript
// Verifique a URL sendo usada
console.log('Supabase URL:', window.location.origin)
// Ou no código do app, logue a URL do cliente Supabase
```

**Ação:** Se a URL não corresponder, corrija a variável de ambiente.

---

### Passo 2: Verificar Schema Exposto

1. No painel do Supabase, vá em **Settings** → **API**
2. Role até a seção **Exposed schemas**
3. Verifique se `public` está na lista
4. Se **NÃO estiver**, adicione `public` e salve

**Alternativa via SQL (verificar configuração):**
```sql
-- Verificar configuração do PostgREST (requer acesso admin)
SELECT * FROM pg_settings WHERE name = 'pgrst.db_schemas';
-- Ou
SHOW pgrst.db_schemas;
```

**Nota:** Se você não tem acesso admin, use o painel (Settings → API).

---

### Passo 3: Recarregar Schema Cache (GARANTIDO)

**Método 1: NOTIFY (recomendado)**
```sql
-- Execute no SQL Editor
NOTIFY pgrst, 'reload schema';
```

**Método 2: pg_notify (alternativa)**
```sql
-- Execute no SQL Editor
SELECT pg_notify('pgrst', 'reload schema');
```

**Método 3: Via Dashboard (se disponível)**
1. Vá em **Settings** → **API**
2. Procure por botão **"Reload Schema"** ou **"Refresh Schema"**
3. Clique e aguarde

**Aguarde:** 10-15 segundos após executar o comando.

**Verificar se funcionou:**
```sql
-- Após aguardar, teste se a tabela está acessível
-- (Isso não testa via REST, mas confirma que o PostgREST viu a mudança)
SELECT * FROM public.lists LIMIT 1;
```

---

## 🛠️ SQL CRIAÇÃO COMPLETA

Execute este SQL **COMPLETO** no SQL Editor (substitui tudo se já existir):

```sql
-- ============================================
-- SQL COMPLETO: Criar public.lists do zero
-- Execute TUDO de uma vez no SQL Editor
-- ============================================

-- 1. Garantir extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Remover tabela se existir (CUIDADO: apaga dados existentes)
DROP TABLE IF EXISTS public.lists CASCADE;

-- 3. Criar tabela public.lists
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Criar índice em user_id
CREATE INDEX lists_user_id_idx ON public.lists(user_id);

-- 5. Criar índice em updated_at (para ordenação)
CREATE INDEX lists_updated_at_idx ON public.lists(updated_at DESC);

-- 6. Criar índice GIN em items (opcional, mas recomendado para JSONB)
CREATE INDEX lists_items_gin_idx ON public.lists USING GIN (items);

-- 7. Habilitar RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 8. Remover policies antigas (evitar conflitos)
DROP POLICY IF EXISTS "lists_select_own" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_own" ON public.lists;
DROP POLICY IF EXISTS "lists_update_own" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_own" ON public.lists;

-- 9. Criar policy SELECT
CREATE POLICY "lists_select_own"
  ON public.lists FOR SELECT
  USING (auth.uid() = user_id);

-- 10. Criar policy INSERT
CREATE POLICY "lists_insert_own"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11. Criar policy UPDATE
CREATE POLICY "lists_update_own"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 12. Criar policy DELETE
CREATE POLICY "lists_delete_own"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- 13. Criar função para trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Criar trigger updated_at
DROP TRIGGER IF EXISTS trg_lists_set_updated_at ON public.lists;
CREATE TRIGGER trg_lists_set_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 15. RECARREGAR SCHEMA CACHE (CRÍTICO - resolve 404)
NOTIFY pgrst, 'reload schema';

-- 16. Verificação final
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'lists'
  ) THEN
    RAISE EXCEPTION 'ERRO: Tabela lists não foi criada!';
  END IF;
  
  RAISE NOTICE '✅ Tabela lists criada com sucesso!';
  RAISE NOTICE '✅ RLS habilitado!';
  RAISE NOTICE '✅ Policies criadas!';
  RAISE NOTICE '✅ Schema cache recarregado!';
  RAISE NOTICE '⏰ Aguarde 10-15 segundos e teste o endpoint /rest/v1/lists';
END $$;
```

**Após executar:**
1. Aguarde **10-15 segundos**
2. Teste o endpoint no app ou console
3. Se ainda der 404, execute novamente: `NOTIFY pgrst, 'reload schema';`

---

## 🧪 TESTE TYPESCRIPT (Console do Navegador)

Cole este código no **Console do Navegador** (F12) após fazer login no app:

```typescript
// ============================================
// TESTE MÍNIMO: Verificar endpoint /rest/v1/lists
// Cole no Console do Navegador (F12)
// ============================================

(async function testeLists() {
  try {
    // 1. Logar VITE_SUPABASE_URL (se disponível)
    console.log('🔍 Verificando configuração...');
    const supabaseUrl = window.location.origin.includes('localhost') 
      ? 'https://fwpdpdtdwxgobpenwfes.supabase.co' // Substitua se necessário
      : import.meta?.env?.VITE_SUPABASE_URL || 'https://fwpdpdtdwxgobpenwfes.supabase.co';
    
    console.log('📍 Supabase URL:', supabaseUrl);
    
    // Obter cliente Supabase (assumindo que está disponível globalmente)
    // Se não estiver, você precisa importar ou acessar de outra forma
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabaseAnonKey = 'SUA_ANON_KEY_AQUI'; // Substitua pela sua anon key
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 2. Pegar usuário logado
    console.log('\n1️⃣ Obtendo usuário logado...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      console.log('💡 Faça login primeiro!');
      return;
    }
    
    console.log('✅ Usuário:', { id: user.id, email: user.email });
    
    // 3. Inserir uma lista
    console.log('\n2️⃣ Inserindo lista...');
    const { data: listaInserida, error: insertError } = await supabase
      .from('lists')
      .insert({
        title: `Teste ${new Date().toISOString()}`,
        items: [],
        user_id: user.id
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      console.error('   Código:', insertError.code);
      console.error('   Mensagem:', insertError.message);
      console.error('   Detalhes:', insertError.details);
      
      if (insertError.code === 'PGRST116' || insertError.message?.includes('relation') || insertError.status === 404) {
        console.error('\n🔴 PROBLEMA: Tabela não encontrada (404)');
        console.error('   → Execute o SQL de criação no Supabase SQL Editor');
        console.error('   → Aguarde 10-15 segundos');
        console.error('   → Execute: NOTIFY pgrst, \'reload schema\';');
      }
      return;
    }
    
    console.log('✅ Lista inserida:', listaInserida);
    
    // 4. Selecionar listas ordenadas por updated_at DESC
    console.log('\n3️⃣ Buscando listas ordenadas por updated_at DESC...');
    const { data: listas, error: selectError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (selectError) {
      console.error('❌ Erro ao buscar:', selectError);
      return;
    }
    
    console.log(`✅ Encontradas ${listas?.length || 0} lista(s):`);
    listas?.forEach((lista, i) => {
      console.log(`   ${i + 1}. ${lista.title} (ID: ${lista.id})`);
    });
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
})();
```

**Versão simplificada (se o cliente Supabase já estiver disponível no app):**

```typescript
// Versão mais simples (assumindo que supabase está disponível)
(async function testeRapido() {
  // 1. Logar URL
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL || 'Não encontrada');
  
  // 2. Pegar usuário
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Usuário:', user?.id);
  
  // 3. Inserir
  const { data, error } = await supabase
    .from('lists')
    .insert({ title: 'Teste', items: [], user_id: user.id })
    .select()
    .single();
  
  if (error) {
    console.error('Erro:', error.code, error.message);
    if (error.status === 404) {
      console.error('🔴 404: Tabela não encontrada ou schema não exposto');
    }
  } else {
    console.log('✅ Sucesso:', data);
  }
  
  // 4. Buscar ordenado
  const { data: listas } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  
  console.log('Listas:', listas);
})();
```

---

## ✅ CHECKLIST FINAL

Valide cada item no painel do Supabase:

### Table Editor
- [ ] Tabela `lists` aparece na lista de tabelas do schema `public`
- [ ] Colunas corretas: `id`, `user_id`, `title`, `items`, `created_at`, `updated_at`
- [ ] Tipo de `items` é `jsonb`
- [ ] Tipo de `id` é `uuid`
- [ ] Tipo de `user_id` é `uuid` com foreign key para `auth.users`

### Settings → API → Exposed schemas
- [ ] `public` está na lista de schemas expostos
- [ ] Se não estiver, adicione `public` e salve

### Authentication → Policies
- [ ] RLS está habilitado na tabela `lists` (toggle ON)
- [ ] Existem 4 policies:
  - [ ] `lists_select_own` (SELECT)
  - [ ] `lists_insert_own` (INSERT)
  - [ ] `lists_update_own` (UPDATE)
  - [ ] `lists_delete_own` (DELETE)

### API Docs (ou Settings → API)
- [ ] Endpoint `/rest/v1/lists` aparece na documentação
- [ ] Métodos disponíveis: GET, POST, PATCH, DELETE
- [ ] Se não aparecer, execute: `NOTIFY pgrst, 'reload schema';` e aguarde

### SQL Editor (verificação)
- [ ] Execute o SQL de verificação e confirme:
  - [ ] `table_name = 'lists'` aparece no resultado
  - [ ] `rls_habilitado = true` (ou `rowsecurity = true`)
  - [ ] 4 policies aparecem na consulta

### Teste no Console
- [ ] Execute o teste TypeScript no console
- [ ] Não retorna erro 404
- [ ] Lista é inserida com sucesso
- [ ] Listas são buscadas ordenadas por `updated_at DESC`

---

## 🎯 RESUMO DA SOLUÇÃO

**Se a tabela NÃO existe:**
1. Execute o **SQL Criação Completa**
2. Aguarde 10-15 segundos
3. Teste no console

**Se a tabela EXISTE mas ainda dá 404:**
1. Verifique **Settings → API → Exposed schemas** (deve ter `public`)
2. Execute: `NOTIFY pgrst, 'reload schema';`
3. Aguarde 10-15 segundos
4. Teste novamente

**Se ainda não funcionar:**
1. Verifique se está usando o projeto correto (URL)
2. Verifique logs do PostgREST (se tiver acesso)
3. Tente criar a tabela novamente com `DROP TABLE` primeiro

---

**Status:** ✅ Tudo pronto para copy/paste e executar.
