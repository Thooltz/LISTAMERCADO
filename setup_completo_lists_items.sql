-- ============================================
-- SETUP COMPLETO: LISTS + ITEMS + RLS + POLICIES
-- Idempotente: pode executar múltiplas vezes sem problemas
-- Não apaga dados existentes
-- ============================================

-- 1. CRIAR TABELA public.lists (se não existir)
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. CRIAR TABELA public.items (se não existir)
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  unit text,
  quantity numeric,
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. CRIAR ÍNDICES (se não existirem)
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_list_id ON public.items(list_id);

-- 4. CRIAR FUNÇÃO para atualizar updated_at (idempotente)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER para updated_at em lists (idempotente)
DROP TRIGGER IF EXISTS update_lists_updated_at ON public.lists;
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. ATIVAR RLS em lists (idempotente)
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 7. ATIVAR RLS em items (idempotente)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 8. REMOVER POLICIES ANTIGAS de lists (para garantir idempotência)
DROP POLICY IF EXISTS "Users can view their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can insert their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.lists;

-- 9. CRIAR POLICIES RLS para lists
CREATE POLICY "Users can view their own lists"
  ON public.lists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists"
  ON public.lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON public.lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON public.lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- 10. REMOVER POLICIES ANTIGAS de items (para garantir idempotência)
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

-- 11. CRIAR POLICIES RLS para items
CREATE POLICY "Users can view their own items"
  ON public.items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON public.items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON public.items
  FOR DELETE
  USING (auth.uid() = user_id);

-- 12. RECARREGAR SCHEMA CACHE DO POSTGREST
NOTIFY pgrst, 'reload schema';

-- ============================================
-- FIM DO SETUP
-- ============================================
