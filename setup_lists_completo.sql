-- ============================================
-- SETUP COMPLETO: TABELA LISTS + RLS + POLICIES
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. CRIAR TABELA public.lists
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. CRIAR ÍNDICE em user_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists(user_id);

-- 3. CRIAR TRIGGER para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. ATIVAR RLS (Row Level Security)
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLICIES RLS
-- Policy para SELECT: usuário só vê suas próprias listas
CREATE POLICY "Users can view their own lists"
  ON public.lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy para INSERT: usuário só pode criar listas para si mesmo
CREATE POLICY "Users can insert their own lists"
  ON public.lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy para UPDATE: usuário só pode atualizar suas próprias listas
CREATE POLICY "Users can update their own lists"
  ON public.lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy para DELETE: usuário só pode deletar suas próprias listas
CREATE POLICY "Users can delete their own lists"
  ON public.lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RECARREGAR SCHEMA CACHE DO POSTGREST
-- Este comando atualiza o cache para que a API REST reconheça a nova tabela
NOTIFY pgrst, 'reload schema';

-- ============================================
-- FIM DO SETUP
-- ============================================
