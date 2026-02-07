# 🔧 Solução Direta: Erro PGRST205

## 1️⃣ Por que PostgREST retorna PGRST205/404?

**Causa exata:**
- PostgREST mantém um **cache do schema** em memória
- Quando você faz `POST /rest/v1/lists`, PostgREST consulta esse cache
- Se `public.lists` não está no cache → retorna `PGRST205` (404)
- Isso acontece quando:
  - ✅ Tabela não existe no banco (95% dos casos)
  - ✅ Tabela existe mas cache não foi atualizado (5% dos casos)

---

## 2️⃣ Checklist de Verificação

### Passo 1: Verificar se tabela existe
1. **Supabase Dashboard** → **Table Editor**
2. Procure por `lists` na lista de tabelas
3. Verifique se está em `public` (não `auth` ou outro)

### Passo 2: Verificar via SQL
Execute o SQL de verificação abaixo

---

## 3️⃣ SQL de Verificação

```sql
-- Verificar se tabela existe e em qual schema
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'lists'
ORDER BY table_schema;

-- Verificar RLS
SELECT 
  tablename,
  schemaname,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'lists';

-- Verificar policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'lists';
```

**Resultado esperado:**
- `table_schema` = `public`
- `table_name` = `lists`
- `rls_enabled` = `true`
- 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

## 4️⃣ SQL Completo: Criar Tabela + RLS + Policies

```sql
-- 1. Garantir extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criar tabela
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS lists_user_id_idx ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS lists_updated_at_idx ON public.lists(updated_at DESC);

-- 4. Função para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para updated_at
DROP TRIGGER IF EXISTS trg_lists_set_updated_at ON public.lists;
CREATE TRIGGER trg_lists_set_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 6. Habilitar RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 7. Remover policies antigas
DROP POLICY IF EXISTS "lists_select_own" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_own" ON public.lists;
DROP POLICY IF EXISTS "lists_update_own" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_own" ON public.lists;

-- 8. Criar policies RLS
CREATE POLICY "lists_select_own"
  ON public.lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "lists_insert_own"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_update_own"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_delete_own"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- 9. FORÇAR RELOAD DO SCHEMA CACHE (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';
```

---

## 5️⃣ Como Forçar Refresh do Schema Cache

### Opção 1: Via SQL (Recomendado)
```sql
NOTIFY pgrst, 'reload schema';
```
**Aguarde 30 segundos** antes de testar.

### Opção 2: Aguardar Automático
- Cache atualiza automaticamente a cada **1-2 minutos**
- Aguarde e tente novamente

### Opção 3: Via Dashboard
1. **Settings** → **API**
2. Procure: **"Reload Schema Cache"** ou **"Refresh Schema"**
3. Clique para recarregar

---

## ✅ Checklist Rápido

Execute na ordem:

1. [ ] Execute o **SQL de verificação** → Confirma se tabela existe
2. [ ] Se não existe → Execute o **SQL completo de criação**
3. [ ] Execute `NOTIFY pgrst, 'reload schema';`
4. [ ] Aguarde 30 segundos
5. [ ] Recarregue a página do frontend
6. [ ] Teste criar uma lista

---

## 🎯 Resultado Esperado

Após executar tudo:
- ✅ Tabela `public.lists` existe
- ✅ RLS habilitado
- ✅ 4 policies criadas
- ✅ Cache atualizado
- ✅ POST `/rest/v1/lists` retorna 201 (não mais 404)
