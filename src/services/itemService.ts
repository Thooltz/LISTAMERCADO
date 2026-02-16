import {
  collection,
  query,
  orderBy,
  getDocs,
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

export interface Item {
  id: string
  name: string
  checked: boolean
  qty: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Converte documento do Firestore para Item
 */
function docToItem(docSnap: QueryDocumentSnapshot<DocumentData>): Item {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    name: data.name || '',
    checked: data.checked || false,
    qty: data.qty || 1,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

/**
 * Obtém todos os itens de uma lista (realtime)
 * Itens não marcados primeiro, depois marcados
 */
export function subscribeItems(
  uid: string,
  listId: string,
  callback: (items: Item[]) => void
): Unsubscribe {
  if (!uid || !listId) {
    throw new Error('UID e listId são obrigatórios')
  }

  const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
  const q = query(itemsRef, orderBy('checked', 'asc'), orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const items = snapshot.docs.map(docToItem)
      // Ordenar: não marcados primeiro, depois marcados
      const sortedItems = items.sort((a, b) => {
        if (a.checked === b.checked) {
          return b.createdAt.getTime() - a.createdAt.getTime()
        }
        return a.checked ? 1 : -1
      })
      callback(sortedItems)
    },
    (error) => {
      console.error('Erro ao buscar itens:', error)
      callback([])
    }
  )
}

/**
 * Obtém todos os itens de uma lista (one-time)
 */
export async function getItems(uid: string, listId: string): Promise<Item[]> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }

    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    const q = query(itemsRef, orderBy('checked', 'asc'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const items = querySnapshot.docs.map(docToItem)
    // Ordenar: não marcados primeiro, depois marcados
    return items.sort((a, b) => {
      if (a.checked === b.checked) {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
      return a.checked ? 1 : -1
    })
  } catch (error: any) {
    console.error('Erro ao buscar itens:', error)
    throw new Error(error.message || 'Erro ao buscar itens')
  }
}

/**
 * Obtém preview de itens (máximo 3) para exibir no card da lista
 */
export async function getItemsPreview(uid: string, listId: string, limit: number = 3): Promise<{ items: Item[]; total: number }> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }

    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    const q = query(itemsRef, orderBy('checked', 'asc'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const allItems = querySnapshot.docs.map(docToItem)
    const sortedItems = allItems.sort((a, b) => {
      if (a.checked === b.checked) {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
      return a.checked ? 1 : -1
    })

    return {
      items: sortedItems.slice(0, limit),
      total: sortedItems.length,
    }
  } catch (error: any) {
    console.error('Erro ao buscar preview de itens:', error)
    return { items: [], total: 0 }
  }
}

/**
 * Adiciona um novo item à lista
 */
export async function addItem(
  uid: string,
  listId: string,
  item: {
    name: string
    qty?: number
  }
): Promise<Item> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }
    if (!item.name || !item.name.trim()) {
      throw new Error('Nome do item é obrigatório')
    }

    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    const qty = item.qty && item.qty > 0 ? item.qty : 1
    
    const docRef = await addDoc(itemsRef, {
      name: item.name.trim(),
      checked: false,
      qty: qty,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Atualizar contador de itens
    const itemsSnapshot = await getDocs(itemsRef)
    const { updateItemCount } = await import('./listService')
    await updateItemCount(uid, listId, itemsSnapshot.size)

    return {
      id: docRef.id,
      name: item.name.trim(),
      checked: false,
      qty: qty,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error: any) {
    console.error('Erro ao adicionar item:', error)
    throw new Error(error.message || 'Erro ao adicionar item')
  }
}

/**
 * Atualiza um item
 */
export async function updateItem(
  uid: string,
  listId: string,
  itemId: string,
  updates: {
    name?: string
    qty?: number
    checked?: boolean
  }
): Promise<void> {
  try {
    if (!uid || !listId || !itemId) {
      throw new Error('UID, listId e itemId são obrigatórios')
    }

    const itemRef = doc(db, 'users', uid, 'lists', listId, 'items', itemId)
    const updateData: any = {
      updatedAt: serverTimestamp(),
    }

    if (updates.name !== undefined) updateData.name = updates.name.trim()
    if (updates.qty !== undefined) updateData.qty = updates.qty > 0 ? updates.qty : 1
    if (updates.checked !== undefined) updateData.checked = updates.checked

    await updateDoc(itemRef, updateData)
  } catch (error: any) {
    console.error('Erro ao atualizar item:', error)
    throw new Error(error.message || 'Erro ao atualizar item')
  }
}

/**
 * Alterna o estado checked de um item
 */
export async function toggleItem(
  uid: string,
  listId: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  try {
    if (!uid || !listId || !itemId) {
      throw new Error('UID, listId e itemId são obrigatórios')
    }

    const itemRef = doc(db, 'users', uid, 'lists', listId, 'items', itemId)
    await updateDoc(itemRef, {
      checked: checked,
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error('Erro ao atualizar item:', error)
    throw new Error(error.message || 'Erro ao atualizar item')
  }
}

/**
 * Remove um item da lista
 */
export async function deleteItem(
  uid: string,
  listId: string,
  itemId: string
): Promise<void> {
  try {
    if (!uid || !listId || !itemId) {
      throw new Error('UID, listId e itemId são obrigatórios')
    }

    const itemRef = doc(db, 'users', uid, 'lists', listId, 'items', itemId)
    await deleteDoc(itemRef)

    // Atualizar contador de itens
    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    const itemsSnapshot = await getDocs(itemsRef)
    const { updateItemCount } = await import('./listService')
    await updateItemCount(uid, listId, itemsSnapshot.size)
  } catch (error: any) {
    console.error('Erro ao remover item:', error)
    throw new Error(error.message || 'Erro ao remover item')
  }
}
