# ✅ Checklist de Validação - Tabela public.lists

Use este checklist para validar que a tabela `public.lists` foi criada corretamente no Supabase e que todas as configurações estão funcionando.

---

## 📋 1. SQL Editor - Executar Script

- [ ] Acesse o **SQL Editor** no painel do Supabase
- [ ] Abra o arquivo `criar_tabela_lists_completo.sql`
- [ ] Cole todo o conteúdo no editor
- [ ] Clique em **Run** (ou pressione Ctrl+Enter)
- [ ] Verifique se apareceu a mensagem: `✅ Tabela lists criada com sucesso!`
- [ ] Verifique se não há erros no console

**Se houver erro:**
- Verifique se você tem permissões de administrador no projeto
- Verifique se a extensão `pgcrypto` está disponível
- Verifique se não há conflitos com tabelas/policies existentes

---

## 📊 2. Table Editor - Verificar Estrutura

- [ ] Acesse **Table Editor** no painel do Supabase
- [ ] Verifique se a tabela `lists` aparece na lista de tabelas do schema `public`
- [ ] Clique na tabela `lists` para ver os detalhes
- [ ] Verifique se as seguintes colunas existem:
  - [ ] `id` (UUID, Primary Key, Default: gen_random_uuid())
  - [ ] `user_id` (UUID, NOT NULL, Foreign Key → auth.users(id))
  - [ ] `title` (TEXT, NOT NULL)
  - [ ] `items` (JSONB, NOT NULL, Default: '[]'::jsonb)
  - [ ] `created_at` (TIMESTAMPTZ, NOT NULL, Default: now())
  - [ ] `updated_at` (TIMESTAMPTZ, NOT NULL, Default: now())

**Verificar índices:**
- [ ] Clique em **Indexes** na aba da tabela
- [ ] Verifique se existe o índice `lists_user_id_idx` em `user_id`
- [ ] Verifique se existe o índice `lists_updated_at_idx` em `updated_at DESC`
- [ ] Verifique se existe o índice `lists_items_gin_idx` (GIN) em `items`

---

## 🔒 3. RLS (Row Level Security) - Verificar Policies

- [ ] Acesse **Authentication** → **Policies** (ou vá direto na tabela `lists`)
- [ ] Verifique se **RLS está habilitado** (deve aparecer um toggle ON)
- [ ] Verifique se existem as seguintes policies:

### Policy: `lists_select_own`
- [ ] Tipo: **SELECT**
- [ ] Expression: `auth.uid() = user_id`
- [ ] Status: **Active**

### Policy: `lists_insert_own`
- [ ] Tipo: **INSERT**
- [ ] Expression: `auth.uid() = user_id` (WITH CHECK)
- [ ] Status: **Active**

### Policy: `lists_update_own`
- [ ] Tipo: **UPDATE**
- [ ] Expression USING: `auth.uid() = user_id`
- [ ] Expression WITH CHECK: `auth.uid() = user_id`
- [ ] Status: **Active**

### Policy: `lists_delete_own`
- [ ] Tipo: **DELETE**
- [ ] Expression: `auth.uid() = user_id`
- [ ] Status: **Active**

**Como verificar via SQL:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'lists';
```

---

## 🔧 4. Triggers - Verificar updated_at

- [ ] Acesse a tabela `lists` no **Table Editor**
- [ ] Clique na aba **Triggers**
- [ ] Verifique se existe o trigger `trg_lists_set_updated_at`
- [ ] Verifique se está associado à função `set_updated_at()`
- [ ] Verifique se é executado **BEFORE UPDATE**

**Teste manual:**
1. Insira uma lista manualmente no Table Editor
2. Anote o valor de `updated_at`
3. Atualize o `title` da lista
4. Verifique se `updated_at` foi atualizado automaticamente

**Como verificar via SQL:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trg_lists_set_updated_at';
```

---

## 🌐 5. API Docs - Verificar Endpoint REST

- [ ] Acesse **API Docs** no painel do Supabase (ou vá em **Project Settings** → **API**)
- [ ] Procure pela tabela `lists` na documentação
- [ ] Verifique se o endpoint `/rest/v1/lists` aparece na lista
- [ ] Verifique se os métodos estão documentados:
  - [ ] GET `/rest/v1/lists` (SELECT)
  - [ ] POST `/rest/v1/lists` (INSERT)
  - [ ] PATCH `/rest/v1/lists` (UPDATE)
  - [ ] DELETE `/rest/v1/lists` (DELETE)

**Teste rápido via curl (substitua `<PROJECT>` e `<ANON_KEY>`):**
```bash
curl -X GET 'https://<PROJECT>.supabase.co/rest/v1/lists?select=*' \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>"
```

**Resultado esperado:**
- Se não estiver autenticado: `[]` (array vazio) ou erro de autenticação
- Se estiver autenticado: array de listas do usuário ou `[]` se não houver

---

## 🧪 6. Teste com Script TypeScript

- [ ] Configure as variáveis de ambiente:
  - [ ] `VITE_SUPABASE_URL` apontando para seu projeto
  - [ ] `VITE_SUPABASE_ANON_KEY` com sua chave anon
- [ ] Faça login no Supabase (via app ou script)
- [ ] Execute o script `teste_lists.ts`:
  ```bash
  npx tsx teste_lists.ts
  # ou
  npx ts-node teste_lists.ts
  ```
- [ ] Verifique se todos os testes passaram:
  - [ ] ✅ Usuário logado obtido
  - [ ] ✅ Lista inserida com sucesso
  - [ ] ✅ Listas buscadas e ordenadas por updated_at DESC
  - [ ] ✅ Lista atualizada (trigger updated_at funcionando)
  - [ ] ✅ RLS funcionando corretamente
  - [ ] ✅ Lista deletada com sucesso

**Alternativa: Teste no console do navegador**
1. Abra o DevTools (F12)
2. Faça login no app
3. Cole o código do `teste_lists.ts` adaptado para o console
4. Execute e verifique os resultados

---

## 🔍 7. Verificação de Schema Cache (PostgREST)

- [ ] Após executar o SQL, aguarde alguns segundos (5-10s)
- [ ] Tente fazer uma requisição GET para `/rest/v1/lists`
- [ ] Verifique se **NÃO** retorna erro 404
- [ ] Verifique se **NÃO** retorna erro PGRST205

**Se ainda retornar 404 ou PGRST205:**
1. Execute novamente o comando no SQL Editor:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. Aguarde 10-15 segundos
3. Tente novamente a requisição

**Alternativa via Dashboard:**
- Alguns projetos Supabase têm um botão "Reload Schema" em **Project Settings** → **API**
- Se disponível, use essa opção

---

## 🐛 8. Troubleshooting - Problemas Comuns

### Erro 404 ao acessar `/rest/v1/lists`
- [ ] Verifique se a tabela existe: `SELECT * FROM information_schema.tables WHERE table_name = 'lists';`
- [ ] Execute novamente: `NOTIFY pgrst, 'reload schema';`
- [ ] Aguarde 10-15 segundos
- [ ] Verifique se a tabela está no schema `public` (não `auth` ou outro)

### Erro PGRST205 (schema cache)
- [ ] Execute: `NOTIFY pgrst, 'reload schema';`
- [ ] Aguarde alguns segundos
- [ ] Tente novamente

### Erro de permissão (RLS bloqueando)
- [ ] Verifique se você está autenticado: `SELECT auth.uid();`
- [ ] Verifique se as policies estão ativas: `SELECT * FROM pg_policies WHERE tablename = 'lists';`
- [ ] Verifique se o `user_id` da lista corresponde ao `auth.uid()`

### Trigger não atualiza `updated_at`
- [ ] Verifique se o trigger existe: `SELECT * FROM pg_trigger WHERE tgname = 'trg_lists_set_updated_at';`
- [ ] Verifique se a função existe: `SELECT * FROM pg_proc WHERE proname = 'set_updated_at';`
- [ ] Teste manualmente atualizando uma linha

---

## ✅ 9. Validação Final

Após completar todos os itens acima:

- [ ] ✅ Tabela `public.lists` criada com todas as colunas
- [ ] ✅ RLS habilitado e policies criadas
- [ ] ✅ Trigger `updated_at` funcionando
- [ ] ✅ Endpoint `/rest/v1/lists` acessível (sem 404)
- [ ] ✅ Schema cache recarregado
- [ ] ✅ Script de teste passou em todos os cenários
- [ ] ✅ App React consegue criar/buscar/atualizar/deletar listas

---

## 📝 Notas Finais

- **Tempo estimado:** 10-15 minutos para completar todo o checklist
- **Dependências:** Nenhuma (a tabela é independente)
- **Rollback:** Se precisar recriar, execute `DROP TABLE IF EXISTS public.lists CASCADE;` e rode o SQL novamente

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do SQL Editor
2. Verifique os logs do PostgREST (se disponível)
3. Consulte a documentação do Supabase: https://supabase.com/docs
4. Verifique se todas as permissões estão corretas

---

**Última atualização:** Data de criação deste checklist
**Status:** ✅ Pronto para uso
