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
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'

export interface MarketItem {
  id: string
  name: string
  qty: number
  checked: boolean
  createdAt: Timestamp | Date
}

/**
 * Converte documento do Firestore para MarketItem
 */
function docToItem(docSnap: QueryDocumentSnapshot<DocumentData>): MarketItem {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    name: data.name || '',
    qty: data.qty || 1,
    checked: data.checked || false,
    createdAt: data.createdAt?.toDate() || new Date(),
  }
}

/**
 * Obtém todos os itens do usuário
 * Ordena por createdAt desc (mais recentes primeiro)
 */
export async function getItems(uid: string): Promise<MarketItem[]> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }

    const itemsRef = collection(db, 'users', uid, 'items')
    const q = query(itemsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docToItem)
  } catch (error: any) {
    console.error('Erro ao buscar itens:', error)
    throw new Error(error.message || 'Erro ao buscar itens')
  }
}

/**
 * Adiciona um novo item à lista do usuário
 */
export async function addItem(
  uid: string,
  name: string,
  qty: number = 1
): Promise<MarketItem> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }
    if (!name || !name.trim()) {
      throw new Error('Nome do item é obrigatório')
    }
    if (qty < 1) {
      throw new Error('Quantidade deve ser maior que zero')
    }

    const itemsRef = collection(db, 'users', uid, 'items')
    const docRef = await addDoc(itemsRef, {
      name: name.trim(),
      qty: qty,
      checked: false,
      createdAt: serverTimestamp(),
    })

    // Retornar o item criado (o createdAt será atualizado quando o documento for lido novamente)
    return {
      id: docRef.id,
      name: name.trim(),
      qty: qty,
      checked: false,
      createdAt: new Date(),
    }
  } catch (error: any) {
    console.error('Erro ao adicionar item:', error)
    throw new Error(error.message || 'Erro ao adicionar item')
  }
}

/**
 * Alterna o estado checked de um item
 */
export async function toggleItem(
  uid: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }
    if (!itemId) {
      throw new Error('ID do item é obrigatório')
    }

    const itemRef = doc(db, 'users', uid, 'items', itemId)
    await updateDoc(itemRef, {
      checked: checked,
    })
  } catch (error: any) {
    console.error('Erro ao atualizar item:', error)
    throw new Error(error.message || 'Erro ao atualizar item')
  }
}

/**
 * Remove um item da lista
 */
export async function removeItem(uid: string, itemId: string): Promise<void> {
  try {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório')
    }
    if (!itemId) {
      throw new Error('ID do item é obrigatório')
    }

    const itemRef = doc(db, 'users', uid, 'items', itemId)
    await deleteDoc(itemRef)
  } catch (error: any) {
    console.error('Erro ao remover item:', error)
    throw new Error(error.message || 'Erro ao remover item')
  }
}
