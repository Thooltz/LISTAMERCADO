-- ============================================
-- ATUALIZAR SCHEMA CACHE DO POSTGREST
-- Execute este SQL após criar/alterar tabelas
-- ============================================

-- Forçar reload do schema cache
NOTIFY pgrst, 'reload schema';

-- Aguarde 30 segundos antes de testar novamente
-- O cache será atualizado e o erro PGRST205 deve desaparecer
