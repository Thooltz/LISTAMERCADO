# 🧪 Testes Rápidos: Tabela lists

## 📝 Exemplos de Chamadas

### 1. INSERT - Criar uma lista

#### Via Supabase JS (Frontend)
```typescript
import { supabase } from './shared/lib/supabase'

// Obter usuário atual
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  throw new Error('Usuário não autenticado')
}

// Criar lista
const { data, error } = await supabase
  .from('lists')
  .insert({
    title: 'Minha Lista de Compras',
    user_id: user.id, // Obrigatório: deve ser o ID do usuário logado
  })
  .select()
  .single()

if (error) {
  console.error('Erro:', error)
} else {
  console.log('Lista criada:', data)
}
```

#### Via listService (Recomendado)
```typescript
import { listService } from './features/lists/services/listService'

// user_id é obtido automaticamente do auth
const novaLista = await listService.create({
  title: 'Minha Lista de Compras'
})

console.log('Lista criada:', novaLista)
```

#### Via SQL Editor (Teste Manual)
```sql
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do seu usuário
-- Para obter seu user_id: SELECT id FROM auth.users WHERE email = 'seu@email.com';

INSERT INTO public.lists (title, user_id)
VALUES ('Minha Lista de Compras', 'SEU_USER_ID_AQUI')
RETURNING *;
```

#### Via cURL (Teste Direto na API)
```bash
# Obter token de autenticação primeiro
TOKEN="seu_jwt_token_aqui"

# Criar lista
curl -X POST \
  'https://fwpdpdtdwxgobpenwfes.supabase.co/rest/v1/lists?select=*' \
  -H "apikey: sua_anon_key" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Minha Lista de Compras",
    "user_id": "seu_user_id_aqui"
  }'
```

---

### 2. SELECT - Buscar listas do usuário (order by updated_at DESC)

#### Via Supabase JS (Frontend)
```typescript
import { supabase } from './shared/lib/supabase'

// Obter usuário atual
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  throw new Error('Usuário não autenticado')
}

// Buscar listas do usuário, ordenadas por updated_at DESC
const { data, error } = await supabase
  .from('lists')
  .select('*')
  .eq('user_id', user.id) // Filtrar apenas listas do usuário atual
  .order('updated_at', { ascending: false }) // Mais recentes primeiro

if (error) {
  console.error('Erro:', error)
} else {
  console.log('Listas encontradas:', data)
}
```

#### Via listService (Recomendado)
```typescript
import { listService } from './features/lists/services/listService'

// user_id é obtido automaticamente do auth
const listas = await listService.getAll()

console.log('Listas encontradas:', listas)
// Já vem ordenado por updated_at DESC
```

#### Via SQL Editor (Teste Manual)
```sql
-- Buscar listas do usuário atual (se estiver logado no SQL Editor)
SELECT * 
FROM public.lists
WHERE user_id = auth.uid()
ORDER BY updated_at DESC;

-- Ou buscar de um usuário específico
SELECT * 
FROM public.lists
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY updated_at DESC;
```

#### Via cURL (Teste Direto na API)
```bash
# Obter token de autenticação primeiro
TOKEN="seu_jwt_token_aqui"
USER_ID="seu_user_id_aqui"

# Buscar listas
curl -X GET \
  "https://fwpdpdtdwxgobpenwfes.supabase.co/rest/v1/lists?user_id=eq.$USER_ID&order=updated_at.desc&select=*" \
  -H "apikey: sua_anon_key" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

### 3. UPDATE - Atualizar uma lista

#### Via listService
```typescript
import { listService } from './features/lists/services/listService'

const listaAtualizada = await listService.update('id-da-lista', {
  title: 'Novo Título'
})

console.log('Lista atualizada:', listaAtualizada)
// updated_at é atualizado automaticamente pelo trigger
```

---

### 4. DELETE - Deletar uma lista

#### Via listService
```typescript
import { listService } from './features/lists/services/listService'

await listService.delete('id-da-lista')
console.log('Lista deletada')
```

---

## ✅ Teste Completo (Fluxo End-to-End)

```typescript
import { listService } from './features/lists/services/listService'

async function testeCompleto() {
  try {
    // 1. Criar lista
    console.log('1. Criando lista...')
    const novaLista = await listService.create({
      title: 'Lista de Teste'
    })
    console.log('✅ Lista criada:', novaLista.id)

    // 2. Buscar todas as listas
    console.log('2. Buscando listas...')
    const listas = await listService.getAll()
    console.log('✅ Listas encontradas:', listas.length)

    // 3. Buscar lista específica
    console.log('3. Buscando lista específica...')
    const lista = await listService.getById(novaLista.id)
    console.log('✅ Lista encontrada:', lista?.title)

    // 4. Atualizar lista
    console.log('4. Atualizando lista...')
    const atualizada = await listService.update(novaLista.id, {
      title: 'Título Atualizado'
    })
    console.log('✅ Lista atualizada:', atualizada.title)

    // 5. Deletar lista
    console.log('5. Deletando lista...')
    await listService.delete(novaLista.id)
    console.log('✅ Lista deletada')

    console.log('🎉 Todos os testes passaram!')
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message)
    
    if (error.isTableNotFound) {
      console.error('⚠️ Tabela não encontrada! Execute database.sql')
    }
  }
}

// Executar teste
testeCompleto()
```

---

## 🔍 Verificações Pós-Teste

Após executar os testes, verifique:

1. **No Table Editor:**
   - [ ] A lista aparece na tabela `lists`?
   - [ ] `user_id` está correto?
   - [ ] `updated_at` foi atualizado automaticamente?

2. **No Console do Navegador:**
   - [ ] Não há erros 404?
   - [ ] Não há erros PGRST205?
   - [ ] As requisições retornam 200/201?

3. **No Network Tab:**
   - [ ] GET `/rest/v1/lists` retorna 200?
   - [ ] POST `/rest/v1/lists` retorna 201?
   - [ ] As respostas contêm os dados esperados?

---

## 🚨 Troubleshooting

### Erro: "Tabela não encontrada"
→ Execute `database.sql` no Supabase SQL Editor

### Erro: "permission denied"
→ Verifique se as policies RLS estão corretas

### Erro: "JWT expired"
→ Faça login novamente

### Erro: "user_id não corresponde"
→ Verifique se está usando `auth.uid()` nas policies
