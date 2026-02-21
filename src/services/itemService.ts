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
  unit?: string
  category?: string
  price?: number | null
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
    unit: data.unit,
    category: data.category,
    price: data.price !== undefined ? (data.price === null ? null : Number(data.price)) : undefined,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

/**
 * Obtém todos os itens de uma lista (realtime)
 * Itens não marcados primeiro, depois marcados (ordenação no front-end)
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
  
  // Função auxiliar para ordenar itens
  const sortItems = (items: Item[]): Item[] => {
    return items.sort((a, b) => {
      // Primeiro: não marcados antes de marcados
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1
      }
      // Segundo: mais recente primeiro
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }

  // Tentar query com orderBy primeiro
  const q = query(itemsRef, orderBy('createdAt', 'desc'))
  let unsubscribeFn: Unsubscribe | null = null

  try {
    unsubscribeFn = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map(docToItem)
        const sortedItems = sortItems(items)
        callback(sortedItems)
      },
      (error) => {
        console.error('Erro ao buscar itens:', error)
        // Se houver erro de índice, tentar query alternativa sem orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          console.warn('Erro de índice detectado. Usando query alternativa sem orderBy...')
          // Criar nova subscription sem orderBy como fallback
          const fallbackQuery = query(itemsRef)
          unsubscribeFn = onSnapshot(
            fallbackQuery,
            (snapshot: QuerySnapshot<DocumentData>) => {
              const items = snapshot.docs.map(docToItem)
              const sortedItems = sortItems(items)
              callback(sortedItems)
            },
            (fallbackError) => {
              console.error('Erro na query alternativa:', fallbackError)
              callback([])
            }
          )
        } else {
          callback([])
        }
      }
    )
  } catch (error: any) {
    // Se houver erro ao criar a subscription, tentar fallback imediatamente
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Erro de índice ao criar subscription. Usando query alternativa...')
      const fallbackQuery = query(itemsRef)
      unsubscribeFn = onSnapshot(
        fallbackQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const items = snapshot.docs.map(docToItem)
          const sortedItems = sortItems(items)
          callback(sortedItems)
        },
        (fallbackError) => {
          console.error('Erro na query alternativa:', fallbackError)
          callback([])
        }
      )
    } else {
      console.error('Erro ao criar subscription:', error)
      callback([])
      return () => {} // Retornar unsubscribe vazio
    }
  }

  // Retornar função de unsubscribe
  return () => {
    if (unsubscribeFn) {
      unsubscribeFn()
    }
  }
}

/**
 * Obtém todos os itens de uma lista (one-time)
 * Itens não marcados primeiro, depois marcados (ordenação no front-end)
 */
export async function getItems(uid: string, listId: string): Promise<Item[]> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }

    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    // Query simples: apenas ordenar por createdAt (sem índice composto necessário)
    let q = query(itemsRef, orderBy('createdAt', 'desc'))
    
    try {
      const querySnapshot = await getDocs(q)
      const items = querySnapshot.docs.map(docToItem)
      // Ordenar no front-end: não marcados primeiro, depois marcados
      return items.sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1
        }
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
    } catch (queryError: any) {
      // Fallback: se houver erro de índice, tentar sem orderBy
      if (queryError.code === 'failed-precondition' || queryError.message?.includes('index')) {
        console.warn('Tentando query alternativa sem orderBy...')
        const fallbackQuery = query(itemsRef)
        const querySnapshot = await getDocs(fallbackQuery)
        const items = querySnapshot.docs.map(docToItem)
        return items.sort((a, b) => {
          if (a.checked !== b.checked) {
            return a.checked ? 1 : -1
          }
          return b.createdAt.getTime() - a.createdAt.getTime()
        })
      }
      throw queryError
    }
  } catch (error: any) {
    console.error('Erro ao buscar itens:', error)
    throw new Error(error.message || 'Erro ao buscar itens')
  }
}

/**
 * Obtém preview de itens (máximo 3) para exibir no card da lista
 * Retorna os itens mais recentes não marcados primeiro
 */
export async function getItemsPreview(uid: string, listId: string, previewLimit: number = 3): Promise<{ items: Item[]; total: number }> {
  try {
    if (!uid || !listId) {
      throw new Error('UID e listId são obrigatórios')
    }

    const itemsRef = collection(db, 'users', uid, 'lists', listId, 'items')
    // Query simples: ordenar por createdAt e limitar para performance
    // Não usar orderBy('checked') para evitar necessidade de índice composto
    let q = query(itemsRef, orderBy('createdAt', 'desc'))
    
    try {
      const querySnapshot = await getDocs(q)
      const allItems = querySnapshot.docs.map(docToItem)
      
      // Ordenar no front-end: não marcados primeiro, depois marcados
      const sortedItems = allItems.sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1
        }
        return b.createdAt.getTime() - a.createdAt.getTime()
      })

      return {
        items: sortedItems.slice(0, previewLimit),
        total: sortedItems.length,
      }
    } catch (queryError: any) {
      // Fallback: se houver erro de índice, tentar sem orderBy
      if (queryError.code === 'failed-precondition' || queryError.message?.includes('index')) {
        console.warn('Tentando query alternativa sem orderBy para preview...')
        const fallbackQuery = query(itemsRef)
        const querySnapshot = await getDocs(fallbackQuery)
        const allItems = querySnapshot.docs.map(docToItem)
        const sortedItems = allItems.sort((a, b) => {
          if (a.checked !== b.checked) {
            return a.checked ? 1 : -1
          }
          return b.createdAt.getTime() - a.createdAt.getTime()
        })
        return {
          items: sortedItems.slice(0, previewLimit),
          total: sortedItems.length,
        }
      }
      throw queryError
    }
  } catch (error: any) {
    console.error('Erro ao buscar preview de itens:', error)
    // Retornar vazio em caso de erro (não quebrar a UI)
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
    unit?: string
    category?: string
    price?: number | null
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
    
    const docData: any = {
      name: item.name.trim(),
      checked: false,
      qty: qty,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    if (item.unit) {
      docData.unit = item.unit
    }
    if (item.category) {
      docData.category = item.category
    }
    if (item.price !== undefined) {
      docData.price = item.price === null || item.price === 0 ? null : Number(item.price)
    }
    
    const docRef = await addDoc(itemsRef, docData)

    // Atualizar contador de itens
    const itemsSnapshot = await getDocs(itemsRef)
    const { updateItemCount } = await import('./listService')
    await updateItemCount(uid, listId, itemsSnapshot.size)

    return {
      id: docRef.id,
      name: item.name.trim(),
      checked: false,
      qty: qty,
      unit: item.unit,
      category: item.category,
      price: item.price !== undefined ? (item.price === null || item.price === 0 ? null : Number(item.price)) : undefined,
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
    unit?: string
    category?: string
    price?: number | null
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
    if (updates.unit !== undefined) updateData.unit = updates.unit || null
    if (updates.category !== undefined) updateData.category = updates.category || null
    if (updates.price !== undefined) {
      updateData.price = updates.price === null || updates.price === 0 ? null : Number(updates.price)
    }

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
