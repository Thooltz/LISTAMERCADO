# ✅ Checklist de Configuração - SmartList

## Passo 1: Executar SQL no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `database.sql` deste projeto
6. **Cole TODO o conteúdo** no editor
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde a mensagem de sucesso: "✅ Tabelas criadas com sucesso!"

**Importante:** Se aparecer algum erro sobre "policy already exists" ou "table already exists", isso é normal. O SQL usa `IF NOT EXISTS` e `DROP POLICY IF EXISTS` para evitar conflitos.

## Passo 2: Verificar Tabelas

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver duas tabelas:
   - `lists` (com colunas: id, user_id, title, created_at, updated_at)
   - `items` (com colunas: id, user_id, list_id, name, quantity, unit, category, price, checked, created_at, updated_at)

## Passo 3: Reiniciar Servidor de Desenvolvimento

⚠️ **CRÍTICO:** O Vite só carrega variáveis de ambiente quando o servidor inicia.

1. No terminal, pare o servidor atual: **Ctrl+C**
2. Execute novamente:
   ```bash
   npm run dev
   ```
3. Aguarde o servidor iniciar completamente

## Passo 4: Testar Funcionalidades

### 4.1 Testar Login/Cadastro
1. Acesse `http://localhost:3000` (ou a porta que aparecer)
2. Clique em "Começar agora"
3. Crie uma conta (email + senha)
4. Você deve ser redirecionado para `/home`

### 4.2 Testar Criação de Lista
1. Na página `/home`, clique em "+ Nova Lista"
2. Digite um nome (ex: "Mercado do mês")
3. Clique em "Criar"
4. A lista deve aparecer na tela
5. **Verifique no console do navegador (F12):** Não deve haver erros 404

### 4.3 Testar Adição de Itens
1. Clique em uma lista para abrir
2. No formulário, adicione um item:
   - Nome: "Leite"
   - Quantidade: 2
   - Unidade: L
   - Categoria: Laticínios
3. Clique em "Adicionar"
4. O item deve aparecer na lista
5. **Verifique no console:** Não deve haver erros 404

### 4.4 Testar Persistência
1. Faça logout (Configurações → Sair)
2. Faça login novamente com a mesma conta
3. Suas listas e itens devem estar lá
4. **Verifique:** Os dados persistem após logout/login

## Passo 5: Verificar Console

Abra o console do navegador (F12) e verifique:

✅ **Não deve aparecer:**
- ❌ Erros 404 em `/rest/v1/lists` ou `/rest/v1/items`
- ❌ "Multiple GoTrueClient instances detected"
- ❌ Warnings sobre props `variant` ou `show` sendo enviadas ao DOM
- ❌ "Fast Refresh: useAuth export is incompatible"

✅ **Deve aparecer (se tudo estiver OK):**
- ✅ "✅ Supabase configurado e conectado" (no primeiro carregamento)

## Problemas Comuns e Soluções

### Erro 404 ao criar/listar listas

**Causa:** Tabelas não foram criadas ou estão em schema errado

**Solução:**
1. Execute o `database.sql` novamente no Supabase
2. Verifique em Table Editor se as tabelas existem
3. Verifique se estão no schema `public` (não `auth` ou outro)

### "Multiple GoTrueClient instances"

**Causa:** HMR criando múltiplas instâncias

**Solução:** Já corrigido no código com singleton pattern. Se ainda aparecer:
1. Pare o servidor completamente
2. Limpe o cache: `rm -rf node_modules/.vite` (ou delete a pasta manualmente)
3. Reinicie: `npm run dev`

### Warnings do styled-components

**Causa:** Props `variant` e `show` sendo passadas ao DOM

**Solução:** Já corrigido usando transient props (`$variant`, `$show`). Se ainda aparecer:
1. Recarregue a página completamente (Ctrl+Shift+R)
2. Verifique se o servidor foi reiniciado após as mudanças

### Fast Refresh não funciona

**Causa:** Exports inconsistentes no AuthProvider

**Solução:** Já corrigido. Se ainda aparecer:
1. Pare e reinicie o servidor
2. Recarregue a página

## ✅ Status Final

Após seguir todos os passos, você deve ter:

- ✅ Tabelas criadas no Supabase
- ✅ RLS ativado e policies funcionando
- ✅ Login/Cadastro funcionando
- ✅ Criação de listas funcionando (sem 404)
- ✅ Adição de itens funcionando (sem 404)
- ✅ Dados persistem após logout/login
- ✅ Sem warnings no console
- ✅ Fast Refresh funcionando

## 🎉 Pronto!

Se todos os itens acima estão marcados, o SmartList está 100% funcional e pronto para uso!
