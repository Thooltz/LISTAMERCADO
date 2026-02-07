-- ============================================
-- DIAGNÓSTICO: Verificar tabela public.lists
-- Execute no SQL Editor do Supabase
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
