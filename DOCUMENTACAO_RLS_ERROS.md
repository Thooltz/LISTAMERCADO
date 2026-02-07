# 📚 Documentação: RLS e Tratamento de Erros no Supabase

## 🔒 Por que NÃO preciso filtrar `user_id` no SELECT?

### Resposta Curta
**RLS (Row Level Security) já filtra automaticamente no banco de dados.**

### Explicação Detalhada

Quando você faz uma query como:
```typescript
const { data } = await supabase
  .from('lists')
  .select('*')
  // NÃO precisa de .eq('user_id', userId) aqui!
```

O Supabase aplica automaticamente as **policies RLS** que você configurou. A policy:
```sql
CREATE POLICY "Users can view their own lists"
  ON public.lists
  FOR SELECT
  USING (auth.uid() = user_id);
```

Isso significa que:
1. O PostgREST (API REST do Supabase) intercepta a query
2. Adiciona automaticamente a condição `WHERE auth.uid() = user_id`
3. Retorna apenas as linhas que passam na verificação
4. O usuário **nunca vê** dados de outros usuários, mesmo que tente

### Vantagens
- ✅ **Segurança**: Impossível "esquecer" de filtrar
- ✅ **Performance**: Filtro acontece no banco (mais rápido)
- ✅ **Simplicidade**: Menos código no frontend
- ✅ **Consistência**: Mesma regra aplicada em todas as queries

### Quando você DEVE filtrar manualmente?
- ❌ **Nunca** para segurança (RLS já faz isso)
- ✅ **Apenas** para filtros de negócio (ex: buscar listas criadas hoje)

---

## 🚨 Diferença entre Erros 404, 401 e 403 no Supabase

### 404 - Not Found (Tabela não encontrada)

**Quando acontece:**
- Tabela `public.lists` não existe no banco
- Schema cache do PostgREST não foi atualizado após criar tabela
- Tabela existe mas não está no schema `public` exposto

**Códigos de erro:**
- `PGRST205` - Table not found in schema cache
- `PGRST116` - Relation does not exist
- `42P01` - PostgreSQL: relation does not exist
- HTTP `404`

**Como resolver:**
1. Criar a tabela no Supabase SQL Editor
2. Executar: `NOTIFY pgrst, 'reload schema';`
3. Verificar em Settings → API → Exposed schemas → `public` está marcado

**Tratamento no código:**
```typescript
if (errorCode === 'PGRST205' || errorStatus === 404) {
  throw new Error('Tabela não encontrada. Execute o SQL de criação.')
}
```

---

### 401 - Unauthorized (Não autenticado)

**Quando acontece:**
- JWT (token) não foi enviado na requisição
- JWT expirou (sessão expirada)
- JWT é inválido ou malformado
- Usuário não está logado

**Códigos de erro:**
- `PGRST301` - JWT expired
- `PGRST302` - JWT invalid
- HTTP `401`

**Como resolver:**
1. Verificar se `supabase.auth.getSession()` retorna sessão válida
2. Fazer login novamente
3. Verificar se o token está sendo enviado no header `Authorization`

**Tratamento no código:**
```typescript
if (errorCode === 'PGRST301' || errorStatus === 401) {
  throw new Error('Sessão expirada. Faça login novamente.')
}
```

**Exemplo prático:**
```typescript
// ❌ ERRADO: Tentar fazer query sem verificar sessão
const { data } = await supabase.from('lists').select('*')

// ✅ CORRETO: Verificar sessão antes
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  throw new Error('Não autenticado')
}
const { data } = await supabase.from('lists').select('*')
```

---

### 403 - Forbidden (Sem permissão)

**Quando acontece:**
- Usuário está autenticado (401 não aconteceu)
- Mas RLS bloqueou a operação
- Policy não permite a ação para este usuário

**Códigos de erro:**
- `42501` - PostgreSQL: insufficient privilege
- HTTP `403`
- Mensagem: "permission denied" ou "row-level security"

**Como resolver:**
1. Verificar se RLS está ativado na tabela
2. Verificar se as policies estão criadas e ativas
3. Verificar se a policy permite a operação (SELECT/INSERT/UPDATE/DELETE)
4. Verificar se `auth.uid()` corresponde ao `user_id` na linha

**Tratamento no código:**
```typescript
if (errorCode === '42501' || errorStatus === 403) {
  throw new Error('Sem permissão. Verifique as policies RLS.')
}
```

**Exemplo prático:**
```sql
-- ❌ ERRADO: Policy que bloqueia tudo
CREATE POLICY "block_all"
  ON public.lists
  FOR SELECT
  USING (false); -- Nunca permite

-- ✅ CORRETO: Policy que permite apenas do próprio usuário
CREATE POLICY "Users can view their own lists"
  ON public.lists
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 Fluxo de Decisão de Erros

```
Requisição → Supabase API
    ↓
Tabela existe?
    ├─ NÃO → 404 (PGRST205)
    └─ SIM → JWT válido?
            ├─ NÃO → 401 (PGRST301)
            └─ SIM → RLS permite?
                    ├─ NÃO → 403 (42501)
                    └─ SIM → ✅ Sucesso (200)
```

---

## 🔍 Como Debugar

### 1. Verificar se tabela existe
```sql
-- No Supabase SQL Editor
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'lists';
```

### 2. Verificar RLS e Policies
```sql
-- Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'lists';

-- Verificar policies
SELECT * FROM pg_policies 
WHERE tablename = 'lists';
```

### 3. Verificar JWT/Sessão
```typescript
// No console do navegador
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
console.log('User ID:', session?.user?.id)
```

### 4. Testar query manualmente
```typescript
// No console do navegador
const { data, error } = await supabase
  .from('lists')
  .select('*')
console.log('Data:', data)
console.log('Error:', error)
```

---

## ✅ Checklist de Verificação

- [ ] Tabela `public.lists` existe no Table Editor
- [ ] RLS está ENABLED na tabela
- [ ] Policies criadas para SELECT, INSERT, UPDATE, DELETE
- [ ] Schema `public` está exposto em Settings → API
- [ ] Schema cache recarregado (`NOTIFY pgrst, 'reload schema'`)
- [ ] Usuário está logado (`auth.getSession()` retorna sessão)
- [ ] JWT não expirou (verificar em DevTools → Application → Local Storage)

---

## 🎯 Resumo

| Erro | Significado | Causa | Solução |
|------|-------------|-------|---------|
| **404** | Tabela não encontrada | Tabela não existe ou cache desatualizado | Criar tabela + recarregar cache |
| **401** | Não autenticado | JWT inválido/expirado | Fazer login novamente |
| **403** | Sem permissão | RLS bloqueou | Verificar policies |

**Regra de ouro:** 
- RLS filtra automaticamente por `user_id` - não precisa filtrar manualmente
- Sempre verificar sessão antes de fazer queries
- Tratar erros 404/401/403 de forma específica no código
