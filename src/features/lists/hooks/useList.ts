import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { getLists, List } from '../../../services/listService'

export function useList(listId: string | undefined) {
  const { user } = useAuth()
  const uid = user?.uid
  const [list, setList] = useState<List | null>(null)

  const {
    data: lists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lists', uid],
    queryFn: () => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return getLists(uid)
    },
    enabled: !!uid && !!listId,
    staleTime: 1000 * 30,
  })

  useEffect(() => {
    if (lists && listId) {
      const foundList = lists.find((l) => l.id === listId)
      setList(foundList || null)
    } else {
      setList(null)
    }
  }, [lists, listId])

  return { 
    list, 
    isLoading, 
    error,
    isNotFound: !isLoading && !error && !list && !!listId,
  }
}
