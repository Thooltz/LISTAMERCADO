import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/AuthProvider'
import { subscribeToList, List } from '../../../services/listService'

export function useList(listId: string | undefined) {
  const { user } = useAuth()
  const uid = user?.uid
  const [list, setList] = useState<List | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!uid || !listId) {
      setList(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeToList(
      uid,
      listId,
      (fetchedList) => {
        setList(fetchedList)
        setIsLoading(false)
      },
      (err) => {
        console.error('Erro ao buscar lista:', err)
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [uid, listId])

  return { 
    list, 
    isLoading, 
    error,
    isNotFound: !isLoading && !error && !list && !!listId,
  }
}
