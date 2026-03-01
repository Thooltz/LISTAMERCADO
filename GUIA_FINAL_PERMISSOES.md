# 🔧 Guia Final: Correção de Permissões Firestore

## 1️⃣ REGRAS FINAIS DO FIRESTORE

**Cole EXATAMENTE isto no Firebase Console e clique em PUBLISH:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // LISTAS
    match /lists/{listId} {

      // Criar: exige login + userId igual ao auth.uid
      allow create: if request.auth != null
        && request.resource.data.userId is string
        && request.resource.data.userId == request.auth.uid;

      // Ler/alterar/deletar: só o dono do doc
      allow read, update, delete: if request.auth != null
        && resource.data.userId is string
        && resource.data.userId == request.auth.uid;

      // ITENS (se houver subcoleção items)
      match /items/{itemId} {
        allow read, write: if request.auth != null
          && get(/databases/$(database)/documents/lists/$(listId)).data.userId == request.auth.uid;
      }
    }
  }
}
```

### 📋 Passo a Passo:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto: **listamercado-433c9**
3. Vá em **Firestore Database** > **Regras**
4. **APAGUE** todo o conteúdo atual
5. **COLE** as regras acima
6. Clique em **PUBLISH** (botão azul no topo)
7. Aguarde confirmação: "Rules published successfully"

---

## 2️⃣ TESTE OBRIGATÓRIO NO RULES PLAYGROUND

### Passo a Passo Completo:

1. **Acesse o Playground:**
   - Firebase Console > Firestore Database > **Regras**
   - Clique em **Rules Playground** ou **Simulator** (canto superior direito)

2. **Configure o Teste CREATE:**

   **Location (Path):**
   ```
   lists/test123
   ```

   **Operation:**
   - Selecione **create**

   **Authentication:**
   - ✅ Marque **Authenticated**
   - **User ID:** `9K62OAWbDFbTNuk5XJx51uQIHbB2`

   **Data (request.resource.data):**
   ```json
   {
     "name": "dd",
     "userId": "9K62OAWbDFbTNuk5XJx51uQIHbB2",
     "itemCount": 0
   }
   ```

3. **Execute:**
   - Clique em **Run** ou **Test**
   - **Resultado Esperado:** ✅ **ALLOW**

4. **Se der DENY:**
   - Verifique se as regras foram publicadas
   - Procure por `match /{document=**}` acima que possa estar bloqueando
   - Verifique se não há outras regras conflitantes

5. **Teste Adicional (Negação):**

   **User ID diferente:**
   - User ID: `OUTRO_UID_QUALQUER`
   - **Resultado Esperado:** ❌ **DENY**

---

## 3️⃣ VALIDAR PROJECT ID NA VERCEL

### No Código:

O código já está logando o `projectId` usando `getApp()`. No console do navegador (produção), você verá:

```javascript
🔥 Firebase projectId: listamercado-433c9
🔥 Firebase authDomain: listamercado-433c9.firebaseapp.com
🔥 Firebase projectId (config): listamercado-433c9
```

### Como Comparar:

1. **No Console do Navegador (Produção/Vercel):**
   - Abra DevTools (F12)
   - Vá em **Console**
   - Procure por `🔥 Firebase projectId:`
   - Anote o valor: `listamercado-433c9`

2. **No Firebase Console:**
   - Canto superior esquerdo mostra o **Project ID**
   - Deve ser: `listamercado-433c9`

3. **Se Não Bater:**
   - Verifique env vars na Vercel
   - Settings > Environment Variables
   - Procure por `VITE_FIREBASE_PROJECT_ID`
   - Se existir e for diferente, atualize ou remova

---

## 4️⃣ VERIFICAR MATCH GLOBAL BLOQUEANDO

### Como Verificar:

1. **Firebase Console** > Firestore > **Regras**
2. Procure por qualquer linha que contenha:
   ```javascript
   match /{document=**} {
     allow read, write: if false;
   }
   ```
   Ou:
   ```javascript
   match /{path=**} {
     allow read, write: if false;
   }
   ```

3. **Se encontrar:**
   - **REMOVA** essa regra completamente
   - Ou coloque o `match /lists` **ANTES** dela

### Exemplo ERRADO (bloqueia tudo):
```javascript
match /databases/{database}/documents {
  // ❌ Isso bloqueia TUDO antes de chegar em /lists
  match /{document=**} {
    allow read, write: if false;
  }

  match /lists/{listId} {
    // Nunca chega aqui
  }
}
```

### Exemplo CORRETO:
```javascript
match /databases/{database}/documents {
  match /lists/{listId} {
    // Regras específicas
  }
  
  // Se precisar de match global, coloque DEPOIS
}
```

---

## 5️⃣ CHECKLIST FINAL

### ✅ Antes de Testar:

- [ ] Regras publicadas no Firebase Console (clique em PUBLISH)
- [ ] Project ID no console do navegador = `listamercado-433c9`
- [ ] Project ID no Firebase Console = `listamercado-433c9`
- [ ] Coleção no Firestore se chama `lists` (minúscula)
- [ ] Não há `match /{document=**}` bloqueando antes de `match /lists`
- [ ] Payload tem `userId` como string (não null, não undefined)

### ✅ Teste no Playground:

- [ ] Teste CREATE com userId correto → **ALLOW**
- [ ] Teste CREATE com userId diferente → **DENY**
- [ ] Teste READ com userId correto → **ALLOW**

### ✅ Teste no App:

- [ ] Login funcionando
- [ ] Console mostra `🔥 Firebase projectId: listamercado-433c9`
- [ ] Console mostra `✅ Criando lista com uid: ...`
- [ ] Console mostra `📦 Payload: { userId: "...", ... }`
- [ ] Criar lista funciona sem erro
- [ ] Documento aparece no Firestore Console
- [ ] Documento tem campo `userId` correto

---

## 🚨 SE AINDA DER ERRO

### Debug Adicional:

1. **Verifique o erro completo:**
   ```javascript
   ❌ Erro ao criar lista: FirebaseError: Missing or insufficient permissions
   ❌ Código do erro: permission-denied
   ```

2. **Capture o Network Request:**
   - DevTools > Network
   - Filtre por "firestore"
   - Veja a requisição que falhou
   - Verifique o payload enviado

3. **Verifique o Token de Autenticação:**
   ```javascript
   // No console do navegador:
   import { auth } from './firebase'
   console.log('Auth current user:', auth.currentUser)
   console.log('Auth uid:', auth.currentUser?.uid)
   console.log('Auth token:', await auth.currentUser?.getIdToken())
   ```

4. **Teste Direto no Firestore Console:**
   - Tente criar um documento manualmente
   - Se funcionar, o problema é nas regras
   - Se não funcionar, o problema é na autenticação

5. **Verifique o Timestamp de Publicação:**
   - Firebase Console > Firestore > Regras
   - Veja "Last published" no topo
   - Deve ser recente (últimos minutos)

---

## 📝 RESUMO RÁPIDO

1. **Cole as regras** no Firebase Console e **PUBLIQUE**
2. **Teste no Playground** antes de testar no app
3. **Verifique o projectId** no console do navegador vs Firebase Console
4. **Confirme a coleção** se chama `lists` (minúscula)
5. **Remova match global** se estiver bloqueando

---

## ✅ RESULTADO ESPERADO

Após seguir todos os passos:

- ✅ Playground mostra **ALLOW** para create
- ✅ Criar lista funciona sem erro
- ✅ Documento criado com `userId` correto
- ✅ Usuários só veem suas próprias listas
- ✅ Logs mostram projectId correto

---

## 🔍 VALIDAÇÃO RÁPIDA

Execute no console do navegador (produção):

```javascript
// Deve mostrar:
🔥 Firebase projectId: listamercado-433c9
🔥 Firebase authDomain: listamercado-433c9.firebaseapp.com
```

Compare com Firebase Console:
- Project ID: `listamercado-433c9` ✅

Se não bater, corrija as env vars na Vercel.
