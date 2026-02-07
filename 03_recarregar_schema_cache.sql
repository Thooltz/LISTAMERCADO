-- ============================================
-- RECARREGAR SCHEMA CACHE DO POSTGREST
-- Execute se ainda estiver recebendo 404 após criar a tabela
-- ============================================

-- Método 1: NOTIFY (recomendado)
NOTIFY pgrst, 'reload schema';

-- Método 2: pg_notify (alternativa)
-- SELECT pg_notify('pgrst', 'reload schema');

-- ⚠️ IMPORTANTE: Aguarde 10-15 segundos após executar
-- Depois teste o endpoint /rest/v1/lists novamente
