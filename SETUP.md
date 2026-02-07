# 🚀 Guia de Configuração Completo - SmartList

Este guia vai te ajudar a configurar o SmartList do zero. Siga os passos na ordem e você terá tudo funcionando em poucos minutos.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no GitHub (para criar conta no Supabase)
- Editor de código (VS Code recomendado)

## 🎯 Passo 1: Instalar Dependências

Se ainda não instalou as dependências:

```bash
npm install
```

## 🎯 Passo 2: Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign in"**
3. Faça login com sua conta do GitHub (ou crie uma conta)
4. Você será redirecionado para o dashboard

## 🎯 Passo 3: Criar um Novo Projeto

1. No dashboard do Supabase, clique no botão **"New Project"**
2. Preencha os dados:
   - **Name**: Escolha um nome (ex: "smartlist-dev")
   - **Database Password**: Crie uma senha forte e **ANOTE** (você precisará depois)
   - **Region**: Escolha a região mais próxima (ex: "South America (São Paulo)")
3. Clique em **"Create new project"**
4. ⏳ Aguarde 2-3 minutos enquanto o projeto é criado

## 🎯 Passo 4: Configurar Autenticação (IMPORTANTE PARA DEV)

⚠️ **CRÍTICO:** Para desenvolvimento local funcionar sem travar em confirmação de email:

1. No dashboard do seu projeto, vá em **Authentication** → **Providers**
2. Clique em **Email**
3. **Desative "Confirm email"** (toggle OFF)
   - Isso permite login imediato sem precisar confirmar email
   - ⚠️ **Apenas para desenvolvimento local** - Em produção, reative para segurança
4. Verifique se **"Enable Email provider"** está ON (habilitado)
5. Clique em **Save**

**💡 Dica:** Se você já criou usuários antes de desativar:
1. Vá em **Authentication** → **Users**
2. Encontre o usuário não confirmado
3. Clique nos **3 pontos** → **Delete**
4. Após desativar a confirmação, cadastre novamente

## 🎯 Passo 5: (Opcional) Ativar Modo DEV no .env

Para melhor experiência em desenvolvimento, você pode adicionar esta linha no arquivo `.env` (que você criará no próximo passo):

```env
VITE_DEV_NO_EMAIL_CONFIRMATION=true
```

Isso mostrará:
- Avisos e instruções claras sobre desativar confirmação de email
- Checklist visual na tela de login
- Botão para abrir o painel do Supabase diretamente
- Prevenção de rate limit (desabilita reenvio de emails)

**⚠️ Importante:** Esta flag é apenas para desenvolvimento local. Não use em produção.

## 🎯 Passo 6: Obter Credenciais do Projeto

1. No dashboard do seu projeto, vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API** no submenu
3. Você verá duas informações importantes:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public** key: Uma chave longa (mais de 100 caracteres)

4. **Copie ambos** e mantenha em um lugar seguro (você vai precisar agora)

## 🎯 Passo 7: Criar o Arquivo .env

1. Na raiz do projeto SmartList (mesma pasta onde está o `package.json`), crie um arquivo chamado `.env`
   - **Importante**: O arquivo deve se chamar exatamente `.env` (com o ponto no início)
   - No VS Code: Clique com botão direito na pasta → New File → Digite `.env`

2. Abra o arquivo `.env` e cole o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# (Opcional) Modo DEV - sem confirmação de email
# VITE_DEV_NO_EMAIL_CONFIRMATION=true
```

3. **Substitua** os valores:
   - `https://seu-projeto.supabase.co` → Cole a **Project URL** que você copiou
   - `sua_chave_anon_aqui` → Cole a **anon public** key que você copiou

4. Salve o arquivo (Ctrl+S)

**Exemplo de como deve ficar:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## 🎯 Passo 8: Configurar o Banco de Dados

1. No Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `database.sql` que está na raiz do projeto SmartList
4. **Copie TODO o conteúdo** do arquivo `database.sql`
5. Cole no editor SQL do Supabase
6. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
7. Você deve ver uma mensagem de sucesso: **"Success. No rows returned"**

✅ Isso criou:
- As tabelas `lists` e `items`
- Os índices para performance
- As políticas de segurança (RLS)
- Os triggers para atualizar `updated_at` automaticamente

## 🎯 Passo 9: Reiniciar o Servidor

⚠️ **IMPORTANTE**: O Vite só carrega variáveis de ambiente quando o servidor inicia. Se você criou ou editou o `.env`, precisa reiniciar.

1. No terminal onde o servidor está rodando, pressione **Ctrl+C** para parar
2. Execute novamente:
   ```bash
   npm run dev
   ```
3. Aguarde o servidor iniciar

## 🎯 Passo 10: Verificar se Está Funcionando

1. Acesse `http://localhost:3000` (ou a porta que aparecer no terminal)
2. Se tudo estiver configurado corretamente:
   - Você verá a tela de **Landing** (não a tela de Setup)
   - Não haverá avisos no console sobre Supabase não configurado
   - Você poderá criar uma conta e fazer login

3. Se ainda aparecer a tela de **Setup**:
   - Verifique se o arquivo `.env` está na raiz do projeto
   - Verifique se copiou as credenciais corretamente (sem espaços extras)
   - Verifique se reiniciou o servidor após criar/editar o `.env`
   - Acesse `/setup` para ver o diagnóstico detalhado

## 🔍 Troubleshooting

### Erro: "Email not confirmed" (400 Bad Request)

**Causa:** O Supabase está configurado para exigir confirmação de email antes de permitir login.

**✅ Solução Recomendada (Desenvolvimento):**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Providers**
4. Clique em **Email**
5. **Desative o toggle "Confirm email"** (OFF)
6. Clique em **Save**
7. Se você já criou usuários, pode precisar apagá-los e criar novamente
8. Agora você pode fazer login sem confirmar email

**⚠️ Importante:** Isso é apenas para desenvolvimento. Em produção, mantenha a confirmação ativada.

**Modo DEV (Opcional):**
Adicione no arquivo `.env`:
```env
VITE_DEV_NO_EMAIL_CONFIRMATION=true
```
Isso mostrará instruções claras na tela de login sobre como desativar a confirmação.

### Erro: "email rate limit exceeded" (429 Too Many Requests)

**Causa:** Você tentou criar muitas contas ou reenviar muitos emails em pouco tempo.

**✅ Solução Definitiva (Recomendado):**
**Desative "Confirm email" no Supabase** - Isso elimina completamente o problema de rate limit, pois não haverá envio de emails.

**Solução Temporária:**
1. **Aguarde alguns minutos** - O rate limit geralmente reseta em 1-5 minutos
2. O app tem cooldown automático de 30s após signup e 60s após rate limit
3. **Use outro email** para testes enquanto aguarda
4. **Não clique várias vezes** - O botão fica desabilitado automaticamente

**Prevenção:**
- O app tem proteção contra múltiplos cliques
- Cooldown automático após signup (30s) e rate limit (60s)
- Botão desabilitado durante o cooldown
- Em modo DEV, o botão de reenviar confirmação é desabilitado

### Erro: "Supabase não configurado"

**Causas possíveis:**
1. Arquivo `.env` não existe ou está no lugar errado
2. Variáveis com nomes errados (deve ser `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
3. Servidor não foi reiniciado após criar/editar `.env`
4. Valores contêm espaços ou caracteres inválidos

**Solução:**
- Verifique se o arquivo está na raiz (mesma pasta do `package.json`)
- Verifique se não há espaços antes ou depois dos `=`
- Reinicie o servidor completamente (Ctrl+C e `npm run dev` novamente)

### Erro: "Failed to fetch" ou "ERR_NAME_NOT_RESOLVED"

**Causa:** URL do Supabase está incorreta ou o projeto foi deletado

**Solução:**
- Verifique se a URL está correta no `.env`
- Verifique se o projeto ainda existe no Supabase
- Certifique-se de que copiou a URL completa (começa com `https://`)

### Erro ao executar o SQL

**Causas possíveis:**
1. SQL já foi executado antes (tabelas já existem)
2. Erro de sintaxe no SQL

**Solução:**
- Se as tabelas já existem, está tudo certo! Pode ignorar o erro
- Se houver erro de sintaxe, verifique se copiou o SQL completo do arquivo `database.sql`

### Porta diferente (ex: 3005)

**Não é um problema!** O Vite pode usar portas diferentes se a 3000 estiver ocupada. Isso não afeta as variáveis de ambiente. Use a porta que aparecer no terminal.

## ✅ Checklist Final

Antes de considerar que está tudo configurado, verifique:

- [ ] Conta criada no Supabase
- [ ] Projeto criado no Supabase
- [ ] Arquivo `.env` criado na raiz do projeto
- [ ] `VITE_SUPABASE_URL` preenchido com a URL correta
- [ ] `VITE_SUPABASE_ANON_KEY` preenchido com a chave correta
- [ ] SQL executado no Supabase (tabelas criadas)
- [ ] Servidor reiniciado após criar/editar `.env`
- [ ] Tela de Setup não aparece mais
- [ ] É possível criar conta e fazer login

## 🎉 Pronto!

Se todos os itens acima estão marcados, você está pronto para usar o SmartList! 

Agora você pode:
- Criar sua primeira lista de compras
- Adicionar itens
- Sincronizar entre dispositivos
- Usar todas as funcionalidades do app

## 📚 Próximos Passos

- Leia o `README.md` para conhecer todas as funcionalidades
- Personalize as categorias em `src/shared/utils/suggestions.ts`
- Faça deploy para produção quando estiver pronto

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas:
1. Acesse `/setup` no app para ver diagnóstico detalhado
2. Verifique os logs no console do navegador (F12)
3. Verifique os logs do terminal onde o servidor está rodando
