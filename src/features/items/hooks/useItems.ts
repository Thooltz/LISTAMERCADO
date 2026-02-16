import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { getItems, addItem, toggleItem, removeItem, updateItem } from '../../../services/listService'
import toast from 'react-hot-toast'

export function useItems(listId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const uid = user?.uid

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items', uid, listId],
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
    mutationFn: ({ name, qty, quantity }: { name: string; qty?: number; quantity?: number; list_id?: string; unit?: string }) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      // list_id e unit são ignorados pois usamos uid diretamente e Firestore não suporta unit ainda
      const finalQty = qty || quantity || 1
      return addItem(uid, name, finalQty)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid, listId] })
      toast.success('Item adicionado!')
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar item:', error)
      toast.error(error.message || 'Erro ao adicionar item')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; quantity?: number; qty?: number; unit?: string; category?: string } }) => {
      if (!uid) {
        throw new Error('Usuário não autenticado')
      }
      return updateItem(uid, id, {
        name: input.name,
        qty: input.qty || input.quantity,
        quantity: input.quantity || input.qty,
        unit: input.unit,
        category: input.category,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid, listId] })
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar item:', error)
      toast.error(error.message || 'Erro ao atualizar item')
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
      await queryClient.cancelQueries({ queryKey: ['items', uid, listId] })
      const previousItems = queryClient.getQueryData(['items', uid, listId])
      queryClient.setQueryData(['items', uid, listId], (old: any[]) =>
        old?.map(item => (item.id === id ? { ...item, checked } : item))
      )
      return { previousItems }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['items', uid, listId], context.previousItems)
      }
      toast.error('Erro ao atualizar item')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid, listId] })
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
      queryClient.invalidateQueries({ queryKey: ['items', uid, listId] })
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
    updateItem: updateMutation.mutateAsync,
    toggleCheck: toggleCheckMutation.mutate,
    deleteItem: deleteMutation.mutateAsync,
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
