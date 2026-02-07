-- ============================================
-- SQL DE VERIFICAÇÃO: Verificar se tabela lists existe
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Verificar se tabela existe e em qual schema
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'lists'
ORDER BY table_schema;

-- 2. Verificar RLS (Row Level Security)
SELECT 
  tablename,
  schemaname,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'lists';

-- 3. Verificar policies RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'lists'
ORDER BY cmd;

-- 4. Verificar estrutura da tabela (se existir)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'lists'
ORDER BY ordinal_position;
