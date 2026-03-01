# 🔧 Correção: Permissões do Firestore

## ✅ Correções Implementadas

### 1. **`listService.ts` - Função `createList`**

**Mudanças:**
- ✅ Verifica `auth.currentUser` diretamente antes de criar
- ✅ Valida que o `uid` passado corresponde ao usuário autenticado
- ✅ Inclui `userId` no payload (obrigatório)
- ✅ Adiciona logs detalhados para debug
- ✅ Usa `getDoc` em vez de `getDocs` para buscar o documento criado

**Código:**
```typescript
export async function createList(uid: string, name: string): Promise<List> {
  // Verificar autenticação diretamente
  const user = auth.currentUser

  if (!user?.uid) {
    console.error('❌ Usuário não autenticado ao criar lista')
    throw new Error('Você precisa estar logado para criar uma lista.')
  }

  // Validar que o uid passado corresponde ao usuário autenticado
  if (uid !== user.uid) {
    console.error('❌ UID não corresponde ao usuário autenticado', { uid, authUid: user.uid })
    throw new Error('Erro de autenticação. Faça login novamente.')
  }

  const payload = {
    name: name.trim(),
    userId: user.uid, // OBRIGATÓRIO
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    itemCount: 0,
  }

  console.log('✅ Criando lista com uid:', user.uid)
  console.log('📦 Payload:', { ...payload, createdAt: '[serverTimestamp]', updatedAt: '[serverTimestamp]' })
  console.log('📍 Path: lists/')

  const listsRef = collection(db, 'lists')
  const docRef = await addDoc(listsRef, payload)

  console.log('✅ Lista criada com sucesso! ID:', docRef.id)
  
  // ... resto do código
}
```

### 2. **`ListsPage.tsx` - Validação antes de criar**

**Mudanças:**
- ✅ Valida se o usuário está logado antes de chamar `createList`
- ✅ Valida se o nome não está vazio
- ✅ Mostra mensagens de erro amigáveis
- ✅ Adiciona logs para debug

**Código:**
```typescript
const handleCreateList = async () => {
  console.log('✅ handleCreateList CHAMADO', listName)
  
  // Validar se o usuário está logado
  if (!user?.uid) {
    console.error('❌ handleCreateList CANCELADO - usuário não autenticado')
    toast.error('Você precisa estar logado para criar uma lista.')
    return
  }

  // Validar se o nome não está vazio
  if (!listName.trim()) {
    console.log('❌ handleCreateList CANCELADO - nome vazio')
    toast.error('O nome da lista é obrigatório.')
    return
  }

  try {
    console.log('✅ Usuário autenticado, criando lista...', { uid: user.uid, name: listName.trim() })
    const newList = await createList(listName.trim())
    // ... resto do código
  } catch (error: any) {
    console.error('❌ Erro ao criar lista:', error)
    const errorMessage = error?.message || 'Erro ao criar lista. Tente novamente.'
    toast.error(errorMessage)
  }
}
```

### 3. **`firebase.ts` - Log do Project ID**

**Mudanças:**
- ✅ Adiciona log do `projectId` em desenvolvimento e produção
- ✅ Útil para verificar se está usando o projeto correto

**Código:**
```typescript
// Log Firebase config em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'N/A',
  })
}

// Log projectId em produção também (útil para debug)
console.log('🔥 Firebase Project ID:', firebaseConfig.projectId)
```

### 4. **Regras do Firestore**

As regras já estão corretas em `FIRESTORE_RULES.txt`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // LISTAS
    match /lists/{listId} {

      allow read, update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;

      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;

      // ITENS DENTRO DA LISTA
      match /items/{itemId} {
        allow read, write: if request.auth != null
          && request.auth.uid == get(/databases/$(database)/documents/lists/$(listId)).data.userId;
      }
    }
  }
}
```

## 🚀 Próximos Passos

### 1. **Publicar Regras do Firestore**

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Vá em **Firestore Database** > **Regras**
3. Cole o conteúdo de `FIRESTORE_RULES.txt`
4. Clique em **Publicar**

### 2. **Verificar Variáveis de Ambiente na Vercel**

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Vá no seu projeto > **Settings** > **Environment Variables**
3. Verifique se existem:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

**OU** se o código está usando variáveis de ambiente, atualize `firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC1pYXtEYxpTcx-fbpM9r6eRo8Sbflfd5s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "listamercado-433c9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "listamercado-433c9",
  // ... resto
}
```

### 3. **Verificar Project ID no Console**

No console do navegador (produção), você verá:
```
🔥 Firebase Project ID: listamercado-433c9
```

Confirme que corresponde ao projeto no Firebase Console.

### 4. **Testar em Produção**

1. **Fazer login** com um usuário
2. **Criar uma nova lista** - Deve funcionar sem erro
3. **Verificar no Firestore Console:**
   - O documento foi criado em `lists/{listId}`
   - O campo `userId` está presente e correto
4. **Testar com outro usuário:**
   - Login com usuário B
   - Não deve ver listas do usuário A

## 🧪 Checklist de Validação

- [ ] Regras do Firestore publicadas
- [ ] Variáveis de ambiente configuradas na Vercel (se necessário)
- [ ] Project ID correto no console
- [ ] Testar criação de lista em produção
- [ ] Verificar documento no Firestore Console
- [ ] Testar isolamento entre usuários

## 📝 Logs Úteis

Ao criar uma lista, você verá no console:

```
✅ handleCreateList CHAMADO Nome da Lista
✅ Usuário autenticado, criando lista... { uid: "...", name: "..." }
✅ Criando lista com uid: ...
📦 Payload: { name: "...", userId: "...", ... }
📍 Path: lists/
✅ Lista criada com sucesso! ID: ...
```

Se houver erro:
```
❌ Erro ao criar lista: FirebaseError: Missing or insufficient permissions
❌ Código do erro: permission-denied
❌ Mensagem do erro: ...
```

## ⚠️ Problemas Comuns

### Erro: "Missing or insufficient permissions"

**Causas possíveis:**
1. Regras do Firestore não publicadas
2. `userId` não está sendo salvo no documento
3. `userId` não corresponde ao `request.auth.uid`
4. Projeto Firebase diferente entre dev e produção

**Solução:**
1. Verificar regras publicadas
2. Verificar logs do console para confirmar `userId`
3. Verificar `projectId` no console do navegador

### Erro: "Usuário não autenticado"

**Causa:** `auth.currentUser` é `null`

**Solução:**
1. Verificar se o usuário fez login
2. Verificar se o token de autenticação não expirou
3. Fazer logout e login novamente

## ✅ Resultado Esperado

Após as correções:
- ✅ Usuários logados conseguem criar listas
- ✅ Cada lista tem `userId` correto
- ✅ Usuários só veem suas próprias listas
- ✅ Logs detalhados para debug
- ✅ Mensagens de erro amigáveis
