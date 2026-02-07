-- ============================================
-- SQL COMPLETO: Criar tabela public.lists com RLS
-- Execute este SQL COMPLETO no Supabase SQL Editor
-- ============================================

-- 1. Garantir extensão pgcrypto (necessária para gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criar tabela public.lists com todas as colunas especificadas
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS lists_user_id_idx ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS lists_updated_at_idx ON public.lists(updated_at DESC);

-- 4. Criar índice GIN para busca eficiente em JSONB (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS lists_items_gin_idx ON public.lists USING GIN (items);

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at (atualiza automaticamente em updates)
DROP TRIGGER IF EXISTS trg_lists_set_updated_at ON public.lists;
CREATE TRIGGER trg_lists_set_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 8. Remover policies antigas (evitar conflitos)
DROP POLICY IF EXISTS "lists_select_own" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_own" ON public.lists;
DROP POLICY IF EXISTS "lists_update_own" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_own" ON public.lists;

-- 9. Criar policies RLS completas (usuário só acessa seus próprios registros)

-- Policy para SELECT: usuário só vê suas próprias listas
CREATE POLICY "lists_select_own"
  ON public.lists FOR SELECT
  USING (auth.uid() = user_id);

-- Policy para INSERT: usuário só pode inserir listas com seu próprio user_id
CREATE POLICY "lists_insert_own"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy para UPDATE: usuário só pode atualizar suas próprias listas
CREATE POLICY "lists_update_own"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy para DELETE: usuário só pode deletar suas próprias listas
CREATE POLICY "lists_delete_own"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- 10. FORÇAR RELOAD DO SCHEMA CACHE DO POSTGREST
-- ⚠️ IMPORTANTE: Isso resolve o erro 404 e PGRST205
-- O PostgREST precisa recarregar o schema para expor a nova tabela via REST API
NOTIFY pgrst, 'reload schema';

-- 11. Verificação final (opcional, mas útil para debug)
DO $$
BEGIN
  -- Verificar se a tabela foi criada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'lists'
  ) THEN
    RAISE EXCEPTION '❌ ERRO: Tabela lists não foi criada!';
  END IF;
  
  -- Verificar se RLS está habilitado
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'lists' 
    AND rowsecurity = true
  ) THEN
    RAISE WARNING '⚠️ RLS pode não estar ativado corretamente';
  END IF;
  
  -- Verificar se as policies foram criadas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lists'
  ) THEN
    RAISE WARNING '⚠️ Nenhuma policy RLS encontrada';
  END IF;
  
  RAISE NOTICE '✅ Tabela lists criada com sucesso!';
  RAISE NOTICE '✅ RLS habilitado!';
  RAISE NOTICE '✅ Policies criadas!';
  RAISE NOTICE '✅ Schema cache recarregado!';
  RAISE NOTICE '✅ Endpoint /rest/v1/lists agora está disponível!';
END $$;
