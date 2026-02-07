-- ============================================
-- SQL DE VERIFICAÇÃO: Diagnóstico PGRST205
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Verificar se existe QUALQUER tabela chamada "lists" e em qual schema
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'lists'
ORDER BY table_schema;

-- 2. Verificar se existe ESPECIFICAMENTE public.lists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'lists'
    ) THEN '✅ Tabela public.lists EXISTE'
    ELSE '❌ Tabela public.lists NÃO EXISTE'
  END as status;

-- 3. Verificar colunas necessárias (se tabela existir)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'lists'
ORDER BY ordinal_position;

-- 4. Verificar RLS
SELECT 
  tablename,
  schemaname,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'lists';

-- 5. Verificar policies
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'lists';
