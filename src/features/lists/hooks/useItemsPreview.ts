import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/AuthProvider'
import { getItemsPreview, Item } from '../../../services/itemService'

export function useItemsPreview(listId: string | undefined) {
  const { user } = useAuth()
  const uid = user?.uid
  const [preview, setPreview] = useState<{ items: Item[]; total: number }>({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!uid || !listId) {
      setPreview({ items: [], total: 0 })
      return
    }

    setIsLoading(true)
    getItemsPreview(uid, listId, 3)
      .then((result) => {
        setPreview(result)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao buscar preview de itens:', error)
        setPreview({ items: [], total: 0 })
        setIsLoading(false)
      })
  }, [uid, listId])

  return { ...preview, isLoading }
}
