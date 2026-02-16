import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { subscribeLists, getLists, createList, renameList, deleteList, List } from '../../../services/listService'
import toast from 'react-hot-toast'

export function useLists() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const uid = user?.uid
  const [lists, setLists] = useState<List[]>([])

  // Realtime subscription
  useEffect(() => {
    if (!uid) {
      setLists([])
      return
    }

    const unsubscribe = subscribeLists(uid, (newLists) => {
      setLists(newLists)
      // Atualizar cache do React Query também
      queryClient.setQueryData(['lists', uid], newLists)
    })

    return () => unsubscribe()
  }, [uid, queryClient])

  // One-time fetch para inicialização
  const {
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lists', uid],
    queryFn: () => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return getLists(uid)
    },
    enabled: !!uid,
    staleTime: 0, // Sempre usar realtime
    initialData: lists,
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return createList(uid, name)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', uid] })
      toast.success('Lista criada com sucesso!')
    },
    onError: (error: any) => {
      console.error('Erro ao criar lista:', error)
      toast.error(error.message || 'Erro ao criar lista')
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return renameList(uid, id, name)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', uid] })
      queryClient.invalidateQueries({ queryKey: ['list'] })
      toast.success('Lista renomeada!')
    },
    onError: (error: any) => {
      console.error('Erro ao renomear lista:', error)
      toast.error(error.message || 'Erro ao renomear lista')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return deleteList(uid, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', uid] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Lista deletada!')
    },
    onError: (error: any) => {
      console.error('Erro ao deletar lista:', error)
      toast.error(error.message || 'Erro ao deletar lista')
    },
  })

  return {
    lists,
    isLoading,
    error,
    refetch,
    createList: createMutation.mutateAsync,
    renameList: renameMutation.mutateAsync,
    deleteList: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isRenaming: renameMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
