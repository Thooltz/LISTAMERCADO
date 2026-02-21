import {
  collection,
  query,
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
import { db } from '../firebase'

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

  const listsRef = collection(db, 'users', uid, 'lists')
  const q = query(listsRef, orderBy('updatedAt', 'desc'))

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

  const listRef = doc(db, 'users', uid, 'lists', listId)

  return onSnapshot(
    listRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docToList(docSnap as QueryDocumentSnapshot<DocumentData>))
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

    const listRef = doc(db, 'users', uid, 'lists', listId)
    const docSnap = await getDoc(listRef)

    if (docSnap.exists()) {
      return docToList(docSnap as QueryDocumentSnapshot<DocumentData>)
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

    const listsRef = collection(db, 'users', uid, 'lists')
    const q = query(listsRef, orderBy('updatedAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docToList)
  } catch (error: any) {
    console.error('Erro ao buscar listas:', error)
    throw new Error(error.message || 'Erro ao buscar listas')
  }
}

/**
 * Cria uma nova lista
 */
export async function createList(uid: string, name: string): Promise<List> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }
    if (!name || !name.trim()) {
      throw new Error('Nome da lista é obrigatório')
    }

    const listsRef = collection(db, 'users', uid, 'lists')
    const docRef = await addDoc(listsRef, {
      name: name.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      itemCount: 0,
    })

    // Buscar o documento criado
    const docSnap = await getDocs(
      query(listsRef, orderBy('updatedAt', 'desc'))
    )
    const createdList = docSnap.docs.find((d) => d.id === docRef.id)

    if (createdList) {
      return docToList(createdList)
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
    console.error('Erro ao criar lista:', error)
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

    const listRef = doc(db, 'users', uid, 'lists', listId)
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
    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    const itemsSnapshot = await getDocs(itemsRef)
    
    const deletePromises = itemsSnapshot.docs.map((itemDoc) =>
      deleteDoc(doc(db, 'users', uid, 'lists', listId, 'items', itemDoc.id))
    )
    
    await Promise.all(deletePromises)

    // Deletar a lista
    const listRef = doc(db, 'users', uid, 'lists', listId)
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

    const listRef = doc(db, 'users', uid, 'lists', listId)
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

    const listRef = doc(db, 'users', uid, 'lists', listId)
    await updateDoc(listRef, {
      budget: budget === null ? null : Number(budget),
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error('Erro ao atualizar orçamento:', error)
    throw new Error(error.message || 'Erro ao atualizar orçamento')
  }
}
