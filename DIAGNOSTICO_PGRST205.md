# 🔍 Diagnóstico PGRST205

## A) 4 Causas Reais do Erro

1. **Tabela não existe** (95% dos casos)
   - `public.lists` nunca foi criada no banco
   - Verificar: `SELECT * FROM information_schema.tables WHERE table_name = 'lists'`

2. **Tabela em schema errado** (3% dos casos)
   - Tabela existe mas em `auth` ou outro schema, não em `public`
   - Verificar: `SELECT table_schema FROM information_schema.tables WHERE table_name = 'lists'`

3. **Nome da tabela diferente** (1% dos casos)
   - Tabela existe mas com nome diferente (case sensitivity, plural/singular)
   - Verificar: `SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%list%'`

4. **Cache do PostgREST desatualizado** (1% dos casos)
   - Tabela existe mas PostgREST não viu ainda
   - Verificar: Tabela existe no Table Editor mas API retorna 404

## Como Confirmar Qual É

Execute o SQL de verificação abaixo.
