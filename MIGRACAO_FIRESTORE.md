# 🔄 Migração Firestore: Estrutura de Dados

## ✅ Mudanças Implementadas

### 1. **Estrutura de Dados**
- **ANTES:** `users/{uid}/lists/{listId}/items/{itemId}`
- **AGORA:** `lists/{listId}/items/{itemId}` com `userId` no documento

### 2. **Regras do Firestore**
As regras foram atualizadas em `FIRESTORE_RULES.txt`:

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

### 3. **Código Atualizado**
- ✅ `src/services/listService.ts` - Todas as funções atualizadas
- ✅ `src/services/itemService.ts` - Todas as funções atualizadas
- ✅ `createList()` agora salva `userId` no documento
- ✅ Queries usam `where('userId', '==', uid)` para filtrar no servidor

## 🚀 Próximos Passos

### 1. **Publicar Regras do Firestore**

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Vá em **Firestore Database** > **Regras**
3. Cole o conteúdo de `FIRESTORE_RULES.txt`
4. Clique em **Publicar**

### 2. **Criar Índice Composto (Obrigatório)**

O Firestore vai solicitar automaticamente a criação de um índice quando você usar a query:
```javascript
where('userId', '==', uid)
orderBy('updatedAt', 'desc')
```

**Opção 1: Automática**
- Ao executar a query pela primeira vez, o Firebase mostrará um link para criar o índice
- Clique no link e crie o índice

**Opção 2: Manual**
1. Acesse **Firestore Database** > **Índices**
2. Clique em **Criar Índice**
3. Configure:
   - **Coleção:** `lists`
   - **Campos:**
     - `userId` (Ascendente)
     - `updatedAt` (Descendente)
   - **Tipo de consulta:** Coleção
4. Clique em **Criar**

### 3. **Migrar Dados Existentes (Opcional)**

Se você já tem dados na estrutura antiga (`users/{uid}/lists`), será necessário migrar:

```javascript
// Script de migração (executar no console do Firebase)
// ATENÇÃO: Faça backup antes!

const admin = require('firebase-admin');
const db = admin.firestore();

async function migrateLists() {
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    const listsSnapshot = await userDoc.ref.collection('lists').get();
    
    for (const listDoc of listsSnapshot.docs) {
      const listData = listDoc.data();
      
      // Criar lista na nova estrutura
      const newListRef = db.collection('lists').doc(listDoc.id);
      await newListRef.set({
        ...listData,
        userId: uid, // Adicionar userId
      });
      
      // Migrar itens
      const itemsSnapshot = await listDoc.ref.collection('items').get();
      const batch = db.batch();
      
      itemsSnapshot.docs.forEach(itemDoc => {
        const itemRef = newListRef.collection('items').doc(itemDoc.id);
        batch.set(itemRef, itemDoc.data());
      });
      
      await batch.commit();
      console.log(`Migrado: ${listDoc.id}`);
    }
  }
}

migrateLists();
```

## ✅ Checklist de Validação

- [ ] Regras do Firestore publicadas
- [ ] Índice composto criado (`userId` + `updatedAt`)
- [ ] Testar criação de nova lista
- [ ] Testar leitura de listas
- [ ] Testar adição de itens
- [ ] Testar que usuário A não vê listas de usuário B

## 🧪 Teste Rápido

1. **Login** com um usuário
2. **Criar lista** - Deve funcionar sem erro de permissão
3. **Adicionar item** - Deve funcionar
4. **Login** com outro usuário
5. **Verificar** - Não deve ver listas do primeiro usuário

## ⚠️ Importante

- **userId é obrigatório** ao criar lista
- As regras bloqueiam acesso se `userId` não corresponder ao usuário autenticado
- O código já está preparado para salvar `userId` automaticamente

## 📝 Notas

- O código foi atualizado para usar `where('userId', '==', uid)` em vez de filtrar no cliente
- Isso é mais eficiente e seguro
- O índice composto é necessário para essa query funcionar
