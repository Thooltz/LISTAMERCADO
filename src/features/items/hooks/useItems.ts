import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { getItems, addItem, toggleItem, removeItem } from '../../../services/listService'
import toast from 'react-hot-toast'

export function useItems() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const uid = user?.uid

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items', uid],
    queryFn: () => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return getItems(uid)
    },
    enabled: !!uid,
    staleTime: 1000 * 30,
  })

  const createMutation = useMutation({
    mutationFn: ({ name, qty }: { name: string; qty?: number }) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return addItem(uid, name, qty || 1)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid] })
      toast.success('Item adicionado!')
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar item:', error)
      toast.error(error.message || 'Erro ao adicionar item')
    },
  })

  const toggleCheckMutation = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return toggleItem(uid, id, checked)
    },
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ['items', uid] })
      const previousItems = queryClient.getQueryData(['items', uid])
      queryClient.setQueryData(['items', uid], (old: any[]) =>
        old?.map(item => (item.id === id ? { ...item, checked } : item))
      )
      return { previousItems }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['items', uid], context.previousItems)
      }
      toast.error('Erro ao atualizar item')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return removeItem(uid, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid] })
      toast.success('Item removido')
    },
    onError: (error: any) => {
      console.error('Erro ao remover item:', error)
      toast.error(error.message || 'Erro ao remover item')
    },
  })

  return {
    items,
    isLoading,
    error,
    addItem: createMutation.mutateAsync,
    toggleCheck: toggleCheckMutation.mutate,
    deleteItem: deleteMutation.mutateAsync,
    isAdding: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
