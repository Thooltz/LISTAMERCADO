import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore'
import { db, auth } from '../firebase'

export interface List {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  itemCount?: number
  budget?: number | null
}

/**
 * Converte documento do Firestore para List
 */
function docToList(docSnap: QueryDocumentSnapshot<DocumentData>): List {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    name: data.name || '',
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    itemCount: data.itemCount || 0,
    budget: data.budget !== undefined ? (data.budget === null ? null : Number(data.budget)) : undefined,
  }
}

/**
 * Obtém todas as listas do usuário (realtime)
 */
export function subscribeLists(
  uid: string,
  callback: (lists: List[]) => void
): Unsubscribe {
  if (!uid) {
    throw new Error('UID do usuário é obrigatório')
  }

  const listsRef = collection(db, 'lists')
  const q = query(
    listsRef,
    where('userId', '==', uid),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const lists = snapshot.docs.map(docToList)
      callback(lists)
    },
    (error) => {
      console.error('Erro ao buscar listas:', error)
      callback([])
    }
  )
}

/**
 * Obtém uma lista específica (realtime)
 */
export function subscribeToList(
  uid: string,
  listId: string,
  callback: (list: List | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!uid || !listId) {
    throw new Error('UID e listId são obrigatórios')
  }

  const listRef = doc(db, 'lists', listId)

  return onSnapshot(
    listRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        // Verificar se a lista pertence ao usuário
        if (data.userId === uid) {
          callback(docToList(docSnap as QueryDocumentSnapshot<DocumentData>))
        } else {
          callback(null)
        }
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error('Erro ao buscar lista:', error)
      if (onError) {
        onError(error as Error)
      }
      callback(null)
    }
  )
}

/**
 * Obtém uma lista específica (one-time)
 */
export async function getList(uid: string, listId: string): Promise<List | null> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }

    const listRef = doc(db, 'lists', listId)
    const docSnap = await getDoc(listRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      // Verificar se a lista pertence ao usuário
      if (data.userId === uid) {
        return docToList(docSnap as QueryDocumentSnapshot<DocumentData>)
      }
    }
    return null
  } catch (error: any) {
    console.error('Erro ao buscar lista:', error)
    throw new Error(error.message || 'Erro ao buscar lista')
  }
}

/**
 * Obtém todas as listas do usuário (one-time)
 */
export async function getLists(uid: string): Promise<List[]> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }

    const listsRef = collection(db, 'lists')
    const q = query(
      listsRef,
      where('userId', '==', uid),
      orderBy('updatedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docToList)
  } catch (error: any) {
    console.error('Erro ao buscar listas:', error)
    throw new Error(error.message || 'Erro ao buscar listas')
  }
}

/**
 * Cria uma nova lista
 * Verifica autenticação diretamente e inclui userId no documento
 */
export async function createList(uid: string, name: string): Promise<List> {
  try {
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

    if (!name || !name.trim()) {
      throw new Error('Nome da lista é obrigatório')
    }

    const payload = {
      name: name.trim(),
      userId: user.uid, // OBRIGATÓRIO: userId deve ser salvo no documento
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

    // Buscar o documento criado
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docToList(docSnap as QueryDocumentSnapshot<DocumentData>)
    }

    // Fallback se não encontrar
    return {
      id: docRef.id,
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      itemCount: 0,
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar lista:', error)
    console.error('❌ Código do erro:', error.code)
    console.error('❌ Mensagem do erro:', error.message)
    throw new Error(error.message || 'Erro ao criar lista')
  }
}

/**
 * Renomeia uma lista
 */
export async function renameList(
  uid: string,
  listId: string,
  name: string
): Promise<void> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }
    if (!listId) {
      throw new Error('ID da lista é obrigatório')
    }
    if (!name || !name.trim()) {
      throw new Error('Nome da lista é obrigatório')
    }

    const listRef = doc(db, 'lists', listId)
    await updateDoc(listRef, {
      name: name.trim(),
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error('Erro ao renomear lista:', error)
    throw new Error(error.message || 'Erro ao renomear lista')
  }
}

/**
 * Deleta uma lista (e todos os seus itens)
 */
export async function deleteList(uid: string, listId: string): Promise<void> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }
    if (!listId) {
      throw new Error('ID da lista é obrigatório')
    }

    // Deletar todos os itens da lista primeiro
    const itemsRef = collection(db, 'lists', listId, 'items')
    const itemsSnapshot = await getDocs(itemsRef)
    
    const deletePromises = itemsSnapshot.docs.map((itemDoc) =>
      deleteDoc(doc(db, 'lists', listId, 'items', itemDoc.id))
    )
    
    await Promise.all(deletePromises)

    // Deletar a lista
    const listRef = doc(db, 'lists', listId)
    await deleteDoc(listRef)
  } catch (error: any) {
    console.error('Erro ao deletar lista:', error)
    throw new Error(error.message || 'Erro ao deletar lista')
  }
}

/**
 * Atualiza o contador de itens de uma lista
 */
export async function updateItemCount(
  uid: string,
  listId: string,
  count: number
): Promise<void> {
  try {
    if (!uid || !listId) return

    const listRef = doc(db, 'lists', listId)
    await updateDoc(listRef, {
      itemCount: count,
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error('Erro ao atualizar contador:', error)
    // Não lançar erro, é opcional
  }
}

/**
 * Atualiza o orçamento de uma lista
 */
export async function updateBudget(
  uid: string,
  listId: string,
  budget: number | null
): Promise<void> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }

    const listRef = doc(db, 'lists', listId)
    await updateDoc(listRef, {
      budget: budget === null ? null : Number(budget),
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error('Erro ao atualizar orçamento:', error)
    throw new Error(error.message || 'Erro ao atualizar orçamento')
  }
}
