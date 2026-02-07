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
