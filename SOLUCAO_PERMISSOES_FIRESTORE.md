# 🔧 Solução Completa: Permissões do Firestore

## 1️⃣ REGRAS FINAIS DO FIRESTORE

Cole estas regras **EXATAS** no Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // LISTAS
    match /lists/{listId} {
      
      // CREATE: apenas se userId do payload == auth.uid
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      // READ, UPDATE, DELETE: apenas se userId do documento == auth.uid
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // ITENS DENTRO DA LISTA
      match /items/{itemId} {
        allow read, write: if request.auth != null
          && get(/databases/$(database)/documents/lists/$(listId)).data.userId == request.auth.uid;
      }
    }
  }
}
```

### 📋 Passo a Passo para Publicar:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto: **listamercado-433c9**
3. Vá em **Firestore Database** > **Regras**
4. **APAGUE** todas as regras antigas
5. **COLE** as regras acima
6. Clique em **Publicar** (botão azul no topo)
7. Aguarde confirmação: "Rules published successfully"

---

## 2️⃣ DIAGNÓSTICO: 5 Causas Mais Prováveis

### 🔴 Causa #1: Regras Antigas Ainda Publicadas

**Sintoma:** Regras corretas no arquivo, mas erro persiste.

**Como Testar:**
1. Abra Firebase Console > Firestore > Regras
2. Verifique se as regras exibidas são **EXATAMENTE** as acima
3. Se forem diferentes, **PUBLIQUE** as novas regras
4. Aguarde 1-2 minutos para propagação

**Solução:**
- Clique em **Publicar** mesmo que pareça que já está publicado
- Verifique o timestamp de "Last published" no topo

---

### 🔴 Causa #2: Projeto Firebase Errado (Vercel Env Vars)

**Sintoma:** App em produção aponta para outro projeto.

**Como Testar:**

**No Console do Navegador (Produção):**
```javascript
// Você deve ver:
🔥 Firebase projectId: listamercado-433c9
```

**No Firebase Console:**
1. Verifique o **Project ID** no canto superior esquerdo
2. Deve ser: **listamercado-433c9**

**Na Vercel:**
1. Vá em **Settings** > **Environment Variables**
2. Verifique se `VITE_FIREBASE_PROJECT_ID` existe e é `listamercado-433c9`
3. Se não existir, o código usa o hardcoded (que está correto)

**Solução:**
- Se os projectIds não batem, corrija as env vars na Vercel
- Ou remova as env vars e use o hardcoded do código

---

### 🔴 Causa #3: Coleção com Nome Diferente

**Sintoma:** Regras para `lists`, mas banco tem `Lists` (maiúscula).

**Como Testar:**
1. Firebase Console > Firestore Database > **Data**
2. Verifique o nome exato da coleção:
   - ✅ Correto: `lists` (minúscula)
   - ❌ Errado: `Lists`, `Lists`, `LISTAS`, etc.

**Solução:**
- Se a coleção for diferente, ajuste as regras OU renomeie a coleção
- **IMPORTANTE:** Firestore é case-sensitive!

---

### 🔴 Causa #4: Match Global Bloqueando Tudo

**Sintoma:** Regra `match /{document=**}` acima bloqueando.

**Como Testar:**
1. Firebase Console > Firestore > Regras
2. Procure por `match /{document=**}` ou `match /{path=**}`
3. Se existir ANTES do `match /lists`, ele pode estar bloqueando

**Solução:**
- Remova qualquer `match /{document=**}` que não seja necessário
- Ou coloque o `match /lists` ANTES de qualquer match global

**Exemplo ERRADO:**
```javascript
match /{document=**} {
  allow read, write: if false; // ❌ BLOQUEIA TUDO
}

match /lists/{listId} {
  // Nunca chega aqui
}
```

**Exemplo CORRETO:**
```javascript
match /lists/{listId} {
  // Regras específicas
}
```

---

### 🔴 Causa #5: Tipo ou Campo Faltando no Payload

**Sintoma:** `userId` existe, mas tipo errado ou campo ausente.

**Como Testar:**

**No Console do Navegador:**
```javascript
// Você deve ver:
📦 Payload: {
  name: "Padaria!",
  userId: "9K62OAWbDFbTNuk5XJx51uQIHbB2", // ✅ String
  createdAt: "[serverTimestamp]",
  updatedAt: "[serverTimestamp]",
  itemCount: 0
}
```

**Verifique:**
- ✅ `userId` é **string** (não null, não undefined)
- ✅ `userId` é **exatamente igual** ao `auth.uid`
- ✅ Não há campos extras que possam causar problema

**Solução:**
- Se `userId` for `null` ou `undefined`, o código já valida
- Se o tipo estiver errado, o Firestore pode rejeitar

---

## 3️⃣ TESTE NO FIRESTORE RULES PLAYGROUND

### Passo a Passo Completo:

1. **Acesse Firebase Console:**
   - Firestore Database > **Regras**
   - Clique em **Rules Playground** (canto superior direito)

2. **Configure o Teste:**

   **Location:**
   ```
   lists/abc123
   ```

   **Authenticated:**
   - ✅ Marque como **Authenticated**
   - **User ID:** `9K62OAWbDFbTNuk5XJx51uQIHbB2`

   **Operation:**
   - Selecione **create**

   **Data (request.resource.data):**
   ```json
   {
     "name": "Padaria!",
     "userId": "9K62OAWbDFbTNuk5XJx51uQIHbB2",
     "createdAt": "2024-01-01T00:00:00Z",
     "updatedAt": "2024-01-01T00:00:00Z",
     "itemCount": 0
   }
   ```

3. **Execute o Teste:**
   - Clique em **Run**
   - **Resultado Esperado:** ✅ **Allow**

4. **Teste de Negação (Opcional):**

   **User ID diferente:**
   - User ID: `OUTRO_UID_DIFERENTE`
   - **Resultado Esperado:** ❌ **Deny**

5. **Teste Read (Opcional):**

   **Location:** `lists/abc123`
   **Operation:** `get`
   **Data (resource.data):**
   ```json
   {
     "name": "Padaria!",
     "userId": "9K62OAWbDFbTNuk5XJx51uQIHbB2",
     "createdAt": "2024-01-01T00:00:00Z",
     "updatedAt": "2024-01-01T00:00:00Z",
     "itemCount": 0
   }
   ```
   - **Resultado Esperado:** ✅ **Allow**

---

## 4️⃣ VALIDAÇÃO DO PROJETO FIREBASE (VERCEL)

### No Código:

O código já está logando o `projectId`. Você verá no console:

```javascript
🔥 Firebase Config: {
  projectId: "listamercado-433c9",
  authDomain: "listamercado-433c9.firebaseapp.com",
  apiKey: "AIzaSyC1pYX..."
}
🔥 Firebase projectId: listamercado-433c9
🔥 Firebase projectId (config): listamercado-433c9
```

### Como Comparar:

1. **No Console do Navegador (Produção):**
   - Abra DevTools (F12)
   - Vá em **Console**
   - Procure por `🔥 Firebase projectId:`
   - Anote o valor: `listamercado-433c9`

2. **No Firebase Console:**
   - Canto superior esquerdo mostra o **Project ID**
   - Deve ser: `listamercado-433c9`

3. **Se Não Bater:**
   - Verifique env vars na Vercel
   - Ou use o hardcoded do código (já está correto)

### Verificar Env Vars na Vercel:

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto
3. Vá em **Settings** > **Environment Variables**
4. Procure por:
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_API_KEY`
   - etc.

5. **Se existirem:**
   - Verifique se `VITE_FIREBASE_PROJECT_ID = listamercado-433c9`
   - Se não, atualize ou remova (para usar hardcoded)

6. **Se não existirem:**
   - O código usa o hardcoded (correto)
   - Não precisa criar env vars

---

## 5️⃣ CHECKLIST FINAL

### ✅ Antes de Testar:

- [ ] Regras publicadas no Firebase Console
- [ ] Project ID no console do navegador = `listamercado-433c9`
- [ ] Project ID no Firebase Console = `listamercado-433c9`
- [ ] Coleção no Firestore se chama `lists` (minúscula)
- [ ] Não há `match /{document=**}` bloqueando antes de `match /lists`
- [ ] Payload tem `userId` como string (não null)

### ✅ Teste no Playground:

- [ ] Teste CREATE com userId correto → **Allow**
- [ ] Teste CREATE com userId diferente → **Deny**
- [ ] Teste READ com userId correto → **Allow**

### ✅ Teste no App:

- [ ] Login funcionando
- [ ] Console mostra `🔥 Firebase projectId: listamercado-433c9`
- [ ] Console mostra `✅ Criando lista com uid: ...`
- [ ] Console mostra `📦 Payload: { userId: "...", ... }`
- [ ] Criar lista funciona sem erro
- [ ] Documento aparece no Firestore Console
- [ ] Documento tem campo `userId` correto

### ✅ Teste de Isolamento:

- [ ] Login com usuário A
- [ ] Criar lista como usuário A
- [ ] Login com usuário B
- [ ] Usuário B **NÃO** vê lista do usuário A

---

## 🚨 SE AINDA FALHAR

### Debug Adicional:

1. **Verifique o erro completo no console:**
   ```javascript
   ❌ Erro ao criar lista: FirebaseError: Missing or insufficient permissions
   ❌ Código do erro: permission-denied
   ❌ Mensagem do erro: ...
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
   ```

4. **Teste Direto no Firestore Console:**
   - Tente criar um documento manualmente
   - Se funcionar, o problema é nas regras
   - Se não funcionar, o problema é na autenticação

---

## 📝 RESUMO RÁPIDO

1. **Cole as regras** no Firebase Console e **PUBLIQUE**
2. **Verifique o projectId** no console do navegador vs Firebase Console
3. **Teste no Playground** antes de testar no app
4. **Confirme a coleção** se chama `lists` (minúscula)
5. **Verifique env vars** na Vercel se estiver usando

---

## ✅ RESULTADO ESPERADO

Após seguir todos os passos:

- ✅ Criar lista funciona sem erro
- ✅ Documento criado com `userId` correto
- ✅ Usuários só veem suas próprias listas
- ✅ Logs mostram projectId correto
- ✅ Playground mostra "Allow" para create
