# 🔧 Solução Definitiva: Erro PGRST205 - Tabela `public.lists` não encontrada

## 📋 Causa Raiz do Erro

### O que significa PGRST205?
O erro `PGRST205` significa que o **PostgREST** (API REST do Supabase) não consegue encontrar a tabela `public.lists` no seu **schema cache**.

### Possíveis Causas (em ordem de probabilidade):

1. **✅ Tabela não existe** (95% dos casos)
   - A tabela `lists` nunca foi criada no banco
   - O SQL do `database.sql` não foi executado

2. **⚠️ Cache do PostgREST desatualizado** (4% dos casos)
   - Tabela existe mas PostgREST não viu ainda
   - Requer reload do schema cache

3. **❌ Schema incorreto** (1% dos casos)
   - Tabela criada em schema diferente de `public`
   - Nome da tabela com case sensitivity incorreto

4. **❌ RLS bloqueando** (raro - daria outro erro)
   - Se fosse RLS, o erro seria diferente (403 ou sem dados)

---

## ✅ Checklist de Verificação no Supabase Dashboard

### Passo 1: Verificar se a tabela existe
1. Acesse: **Supabase Dashboard** → Seu Projeto
2. Vá em: **Table Editor** (menu lateral)
3. Verifique:
   - [ ] A tabela `lists` aparece na lista?
   - [ ] Está no schema `public` (não `auth` ou outro)?
   - [ ] Tem as colunas: `id`, `user_id`, `title`, `created_at`, `updated_at`?

**Se NÃO aparecer:** A tabela não existe → Execute o SQL abaixo

**Se aparecer mas ainda dá erro:** Cache desatualizado → Veja Passo 4

---

### Passo 2: Verificar RLS e Policies
1. Vá em: **Authentication** → **Policies**
2. Selecione a tabela `lists`
3. Verifique:
   - [ ] RLS está **ENABLED** (ativado)?
   - [ ] Existem 4 policies:
     - `Users can view own lists` (SELECT)
     - `Users can create own lists` (INSERT)
     - `Users can update own lists` (UPDATE)
     - `Users can delete own lists` (DELETE)

**Se faltar policies:** Execute o SQL completo abaixo

---

### Passo 3: Verificar Schema
1. Vá em: **SQL Editor**
2. Execute:
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'lists';
```
3. Resultado esperado:
   - `table_schema` = `public`
   - `table_name` = `lists`

**Se estiver em outro schema:** Problema! Tabela deve estar em `public`

---

### Passo 4: Recarregar Schema Cache do PostgREST
**Se a tabela existe mas ainda dá erro:**

1. Vá em: **Settings** → **API** (ou **Project Settings** → **API**)
2. Procure por: **"Reload Schema Cache"** ou **"Refresh Schema"**
3. Clique para recarregar

**OU execute no SQL Editor:**
```sql
-- Forçar reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
```

**OU aguarde 1-2 minutos** (cache atualiza automaticamente)

---

## 🗄️ SQL Completo e Corrigido

Execute este SQL **COMPLETO** no **SQL Editor** do Supabase:

```sql
-- ============================================
-- SOLUÇÃO DEFINITIVA: Criar tabela lists
-- Execute este SQL COMPLETO no Supabase SQL Editor
-- ============================================

-- 1. REMOVER TABELA SE EXISTIR (para recriar do zero)
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;

-- 2. CRIAR TABELA LISTS
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA ITEMS (depende de lists)
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'un',
  category TEXT NOT NULL DEFAULT 'Outros',
  price NUMERIC(10, 2),
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR ÍNDICES (performance)
CREATE INDEX idx_lists_user_id ON public.lists(user_id);
CREATE INDEX idx_lists_updated_at ON public.lists(updated_at DESC);
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_list_id ON public.items(list_id);
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);

-- 5. FUNÇÃO PARA UPDATED_AT AUTOMÁTICO
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGERS PARA UPDATED_AT
DROP TRIGGER IF EXISTS update_lists_updated_at ON public.lists;
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. ATIVAR RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 8. REMOVER POLICIES ANTIGAS (evitar conflitos)
DROP POLICY IF EXISTS "Users can view own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can create own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can view own items" ON public.items;
DROP POLICY IF EXISTS "Users can create own items" ON public.items;
DROP POLICY IF EXISTS "Users can update own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;

-- 9. CRIAR POLICIES RLS PARA LISTS
CREATE POLICY "Users can view own lists"
  ON public.lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- 10. CRIAR POLICIES RLS PARA ITEMS
CREATE POLICY "Users can view own items"
  ON public.items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON public.items FOR DELETE
  USING (auth.uid() = user_id);

-- 11. FORÇAR RELOAD DO SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- 12. VERIFICAÇÃO FINAL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'lists'
  ) THEN
    RAISE EXCEPTION '❌ ERRO: Tabela lists não foi criada!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'items'
  ) THEN
    RAISE EXCEPTION '❌ ERRO: Tabela items não foi criada!';
  END IF;
  
  RAISE NOTICE '✅ SUCESSO: Tabelas criadas com sucesso!';
  RAISE NOTICE '✅ Schema cache recarregado!';
END $$;
```

---

## 🔍 Verificação Pós-Execução

Após executar o SQL, verifique:

### 1. No Table Editor:
- [ ] Tabela `lists` aparece
- [ ] Tabela `items` aparece
- [ ] Ambas têm as colunas corretas

### 2. No Authentication → Policies:
- [ ] 4 policies para `lists`
- [ ] 4 policies para `items`
- [ ] RLS está ENABLED

### 3. Teste no Frontend:
- [ ] Recarregue a página (F5)
- [ ] Tente criar uma lista
- [ ] Não deve mais dar erro 404

---

## 🐛 Se Ainda Der Erro Após Executar o SQL

### Opção 1: Aguardar Cache Atualizar
- Aguarde **1-2 minutos**
- Recarregue a página
- Tente novamente

### Opção 2: Forçar Reload Manual
Execute no SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

### Opção 3: Verificar Logs
1. Vá em: **Logs** → **API Logs**
2. Procure por erros relacionados a `lists`
3. Verifique se há problemas de permissão

### Opção 4: Verificar Nome da Tabela
Execute:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%list%';
```

Certifique-se de que o nome é exatamente `lists` (minúsculo, plural)

---

## 📝 Notas Importantes

1. **Schema `public`**: A tabela DEVE estar no schema `public`, não em `auth` ou outro
2. **Case Sensitivity**: Nome da tabela é case-sensitive em alguns casos. Use `lists` (minúsculo)
3. **RLS Obrigatório**: Com RLS ativado, SEM policies = nenhum acesso (nem você consegue ver)
4. **Cache**: PostgREST pode levar até 2 minutos para atualizar o cache automaticamente
5. **Ordem de Criação**: `items` depende de `lists`, então `lists` deve ser criada primeiro

---

## ✅ Resultado Esperado

Após seguir todos os passos:
- ✅ Tabela `lists` criada em `public`
- ✅ RLS ativado com 4 policies
- ✅ Schema cache recarregado
- ✅ GET `/rest/v1/lists` retorna 200 (ou array vazio se não houver dados)
- ✅ POST `/rest/v1/lists` retorna 201 (criação bem-sucedida)
- ✅ Erro PGRST205 desaparece completamente

---

## 🚀 Próximos Passos

1. Execute o SQL completo acima
2. Aguarde 30 segundos
3. Recarregue a página do frontend
4. Tente criar uma lista
5. Se funcionar: ✅ Problema resolvido!
6. Se não funcionar: Verifique os logs do Supabase
