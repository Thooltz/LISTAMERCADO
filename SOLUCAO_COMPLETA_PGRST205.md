# ✅ Solução Completa: Erro PGRST205

## 1️⃣ Checklist Rápido

1. [ ] Execute `verificar_lists.sql` no Supabase SQL Editor
2. [ ] Se tabela não existe → Execute `database.sql` completo
3. [ ] Se tabela existe mas dá erro → Execute `NOTIFY pgrst, 'reload schema';`
4. [ ] Aguarde 30 segundos
5. [ ] Recarregue a página do frontend (F5)
6. [ ] Teste criar/listar listas

---

## 2️⃣ SQL de Verificação

**Arquivo:** `verificar_lists.sql`

```sql
-- 1. Verificar se existe QUALQUER tabela "lists" e em qual schema
SELECT table_schema, table_name, table_type
FROM information_schema.tables 
WHERE table_name = 'lists';

-- 2. Verificar se existe ESPECIFICAMENTE public.lists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'lists'
    ) THEN '✅ Tabela public.lists EXISTE'
    ELSE '❌ Tabela public.lists NÃO EXISTE'
  END as status;

-- 3. Verificar colunas necessárias
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'lists'
ORDER BY ordinal_position;
```

---

## 3️⃣ SQL Completo (database.sql)

**Arquivo:** `database.sql`

```sql
-- 1. Garantir extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criar tabela public.lists
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS lists_user_id_idx ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS lists_updated_at_idx ON public.lists(updated_at DESC);

-- 4. Função para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para updated_at
DROP TRIGGER IF EXISTS trg_lists_set_updated_at ON public.lists;
CREATE TRIGGER trg_lists_set_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 6. Habilitar RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 7. Remover policies antigas
DROP POLICY IF EXISTS "lists_select_own" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_own" ON public.lists;
DROP POLICY IF EXISTS "lists_update_own" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_own" ON public.lists;

-- 8. Criar policies RLS
CREATE POLICY "lists_select_own"
  ON public.lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "lists_insert_own"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_update_own"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_delete_own"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- 9. FORÇAR RELOAD DO SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
```

---

## 4️⃣ Como Atualizar Schema Cache do PostgREST

### Opção 1: Via SQL (Recomendado)
```sql
NOTIFY pgrst, 'reload schema';
```
**Aguarde 30 segundos** antes de testar.

### Opção 2: Via Dashboard
1. **Settings** → **API**
2. Procure: **"Reload Schema Cache"** ou **"Refresh Schema"**
3. Clique para recarregar

### Opção 3: Aguardar Automático
- Cache atualiza automaticamente a cada **1-2 minutos**

---

## 5️⃣ Patch do Código Frontend

### listService.ts - Melhorar handleSupabaseError

**Substituir a função `handleSupabaseError`:**

```typescript
function handleSupabaseError(error: any, tableName: string = 'lists'): never {
  const errorCode = error?.code || ''
  const errorMessage = String(error?.message || error?.details || error?.hint || '')
  const errorStatus = error?.status || (error as any)?.httpStatus || (error as any)?.response?.status

  // Detectar erro de tabela não encontrada (PGRST205, PGRST116, 404)
  const isTableNotFound = 
    errorCode === 'PGRST205' ||
    errorCode === 'PGRST116' ||
    errorCode === '42P01' ||
    errorStatus === 404 ||
    errorMessage.includes('Could not find the table') ||
    errorMessage.includes('in the schema cache')

  if (isTableNotFound) {
    const friendlyError: TableNotFoundError = new Error(
      `Crie a tabela public.${tableName} e atualize schema cache (NOTIFY pgrst, 'reload schema')`
    ) as TableNotFoundError
    friendlyError.isTableNotFound = true
    friendlyError.code = errorCode || 'PGRST205'
    throw friendlyError
  }

  // Outros erros...
  throw new Error(errorMessage || `Erro ao acessar ${tableName}: ${errorCode || 'Erro desconhecido'}`)
}
```

### useLists.ts - Desabilitar Retry para PGRST205

**Adicionar/Atualizar funções:**

```typescript
// Função para verificar se o erro é de tabela não encontrada
function isTableNotFoundError(error: any): boolean {
  return (
    error?.isTableNotFound === true ||
    error?.code === 'PGRST205' ||
    error?.code === 'PGRST116' ||
    error?.status === 404 ||
    error?.message?.includes('PGRST205') ||
    error?.message?.includes('schema cache') ||
    error?.message?.includes('Could not find the table')
  )
}

// Função para determinar se deve fazer retry
function shouldRetry(failureCount: number, error: any): boolean {
  // NUNCA fazer retry se a tabela não existe (PGRST205)
  if (isTableNotFoundError(error)) {
    return false
  }
  
  // Para outros erros, fazer retry até 2 vezes
  return failureCount < 2
}
```

**Aplicar nas queries e mutations:**

```typescript
// Na query
const { data: lists = [], isLoading, error } = useQuery({
  queryKey: ['lists', user?.id],
  queryFn: () => listService.getAll(user!.id),
  enabled: !!user,
  retry: shouldRetry, // ✅ Retry condicionado
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})

// Nas mutations
const createMutation = useMutation({
  mutationFn: (input: CreateListInput) => listService.create(input, user!.id),
  retry: shouldRetry, // ✅ Não faz retry se PGRST205
  onError: (error: any) => {
    if (isTableNotFoundError(error)) {
      toast.error(
        'Tabela public.lists não encontrada. Crie a tabela e atualize schema cache.',
        {
          duration: 8000,
          id: 'table-not-found', // Evitar múltiplos toasts
        }
      )
    } else {
      toast.error(error.message || 'Erro ao criar lista')
    }
  },
})
```

---

## ✅ Resultado Esperado

Após seguir todos os passos:
- ✅ Tabela `public.lists` criada
- ✅ RLS e policies funcionando
- ✅ Cache atualizado
- ✅ **Retry desabilitado para PGRST205** (não spamma mais)
- ✅ Mensagem de erro clara e curta
- ✅ Erro PGRST205 resolvido
