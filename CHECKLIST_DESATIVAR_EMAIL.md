# ✅ Checklist: Desativar Envio de Emails no Supabase

Use este checklist para garantir que o envio de emails está **completamente desativado**.

---

## 🔧 Configuração no Supabase Dashboard

### Passo 1: Desativar Confirmação de Email
- [ ] Acessei **Authentication** → **Providers** → **Email**
- [ ] Desativei o toggle **"Confirm email"** (está OFF)
- [ ] Cliquei em **Save**

### Passo 2: Verificar Provider Email
- [ ] Verifiquei que **"Enable Email provider"** está **ON** (habilitado)
- [ ] Isso é necessário para login com email/senha funcionar

### Passo 3: Desativar Magic Link (se existir)
- [ ] Verifiquei se existe opção **"Magic Link"** ou **"Enable Magic Link"**
- [ ] Se existir, desativei (toggle OFF)
- [ ] Cliquei em **Save**

### Passo 4: Limpar Usuários Não Confirmados
- [ ] Acessei **Authentication** → **Users**
- [ ] Identifiquei usuários com status **"Unconfirmed"** ou **"Email not confirmed"**
- [ ] Apaguei todos os usuários não confirmados (3 pontos → Delete)
- [ ] **OU** confirmei manualmente cada usuário

---

## 💻 Verificação no Código

### Verificar que Apenas Métodos Corretos São Usados

Abra o arquivo `src/features/auth/context/AuthProvider.tsx` e verifique:

- [ ] **Login usa apenas:** `supabase.auth.signInWithPassword()`
- [ ] **Cadastro usa apenas:** `supabase.auth.signUp()`
- [ ] **NÃO há:** `signInWithOtp()` (envia email)
- [ ] **NÃO há:** `resetPasswordForEmail()` (envia email)
- [ ] **NÃO há:** `resend()` chamado automaticamente

### Verificar que resendConfirmation Não é Chamado Automaticamente

- [ ] A função `resendConfirmation` existe mas **não é chamada automaticamente**
- [ ] Ela só é chamada se o usuário clicar manualmente em um botão (e em dev mode está bloqueada)

---

## 🧪 Testes Funcionais

### Teste 1: Cadastro Novo
```
1. Acesse a tela de cadastro
2. Preencha email: teste@exemplo.com
3. Preencha senha: 123456
4. Clique em "Criar conta"
5. ✅ Deve entrar imediatamente no app (sem pedir confirmação)
6. ✅ Não deve aparecer mensagem "Verifique seu email"
7. ✅ Não deve aparecer erro "email_not_confirmed"
```

- [ ] ✅ Cadastro funcionou imediatamente
- [ ] ✅ Não pediu confirmação de email
- [ ] ✅ Entrou no app automaticamente

### Teste 2: Login
```
1. Faça logout
2. Acesse a tela de login
3. Preencha email: teste@exemplo.com
4. Preencha senha: 123456
5. Clique em "Entrar"
6. ✅ Deve entrar imediatamente (sem enviar email)
7. ✅ Não deve aparecer erro "email_not_confirmed"
```

- [ ] ✅ Login funcionou imediatamente
- [ ] ✅ Não enviou email
- [ ] ✅ Não pediu confirmação

### Teste 3: Console do Navegador
```
1. Abra o console (F12)
2. Faça cadastro ou login
3. Verifique se há erros
```

- [ ] ✅ Não apareceu erro 400 "email_not_confirmed"
- [ ] ✅ Não apareceu erro 429 "rate limit"
- [ ] ✅ Não apareceu erro relacionado a email

### Teste 4: Network (Requisições)
```
1. Abra a aba Network (F12)
2. Faça cadastro ou login
3. Verifique as requisições feitas
```

- [ ] ✅ Não há requisição POST para `/auth/v1/resend`
- [ ] ✅ Não há requisição POST para `/auth/v1/otp`
- [ ] ✅ Não há requisição POST para `/auth/v1/recover`
- [ ] ✅ Apenas há requisições para `/auth/v1/token` (login) e `/auth/v1/signup` (cadastro)

---

## 📊 Resumo das Configurações

| Item | Status | Observação |
|------|--------|------------|
| **Confirm email** | ❌ OFF | Desativado |
| **Enable Email provider** | ✅ ON | Habilitado (necessário) |
| **Magic Link** | ❌ OFF | Desativado (se existir) |
| **Usuários não confirmados** | 🗑️ Apagados | Limpos |
| **Código usa signInWithPassword** | ✅ Sim | Correto |
| **Código usa signUp** | ✅ Sim | Correto |
| **Código NÃO usa OTP/Magic Link** | ✅ Sim | Correto |

---

## 🎯 Resultado Final Esperado

Após completar este checklist:

✅ **Cadastro:** Usuário se cadastra e **entra imediatamente** no app  
✅ **Login:** Usuário faz login e **entra imediatamente** (sem enviar email)  
✅ **Sem emails:** Nenhum email é enviado automaticamente  
✅ **Sem confirmação:** Não existe fluxo de "verifique seu email"  
✅ **Sem erros:** Não aparecem erros de "email_not_confirmed"  

---

## ⚠️ Se Algo Não Funcionar

### Ainda recebe erro "email_not_confirmed"
1. Verifique se apagou todos os usuários não confirmados
2. Cadastre um **novo usuário** (não use um antigo)
3. Verifique se "Confirm email" está realmente OFF no Supabase

### Ainda recebe emails
1. Verifique novamente **Authentication** → **Providers** → **Email**
2. Certifique-se de que **"Confirm email"** está **OFF**
3. Verifique se não há templates automáticos em **Settings** → **Auth**

### Login não funciona
1. Verifique se **"Enable Email provider"** está **ON**
2. Verifique se está usando `signInWithPassword` no código
3. Verifique se email e senha estão corretos

---

## 📝 Notas Finais

- Esta configuração é **permanente** no Supabase
- Novos usuários **sempre** entrarão imediatamente após cadastro
- Não é necessário confirmar email em nenhum momento
- O app funciona **100% offline** em relação a emails (não depende de email)

---

## ✅ Checklist Completo?

Marque quando concluir:

- [ ] Todas as configurações no Supabase foram feitas
- [ ] Todos os testes funcionais passaram
- [ ] Console não mostra erros
- [ ] Network não mostra requisições de email
- [ ] Cadastro funciona imediatamente
- [ ] Login funciona imediatamente
- [ ] Não há envio de emails

**🎉 Se todos os itens estão marcados, o envio de emails está completamente desativado!**
