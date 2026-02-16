import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { subscribeItems, getItems, addItem, updateItem, toggleItem, deleteItem, Item } from '../../../services/itemService'
import toast from 'react-hot-toast'

export function useItems(listId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const uid = user?.uid
  const [items, setItems] = useState<Item[]>([])

  // Realtime subscription
  useEffect(() => {
    if (!uid || !listId) {
      setItems([])
      return
    }

    const unsubscribe = subscribeItems(uid, listId, (newItems) => {
      setItems(newItems)
      // Atualizar cache do React Query também
      queryClient.setQueryData(['items', uid, listId], newItems)
    })

    return () => unsubscribe()
  }, [uid, listId, queryClient])

  // One-time fetch para inicialização
  const {
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items', uid, listId],
    queryFn: () => {
      if (!uid || !listId) {
        throw new Error('UID e listId são obrigatórios')
      }
      return getItems(uid, listId)
    },
    enabled: !!uid && !!listId,
    staleTime: 0, // Sempre usar realtime
    initialData: items,
  })

  const createMutation = useMutation({
    mutationFn: (item: { name: string; qty?: number; unit?: string; category?: string }) => {
      if (!uid || !listId) {
        throw new Error('Usuário não autenticado ou lista não selecionada')
      }
      return addItem(uid, listId, item)
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
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; qty?: number; unit?: string; category?: string; checked?: boolean } }) => {
      if (!uid || !listId) {
        throw new Error('Usuário não autenticado ou lista não selecionada')
      }
      return updateItem(uid, listId, id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', uid, listId] })
      toast.success('Item atualizado!')
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar item:', error)
      toast.error(error.message || 'Erro ao atualizar item')
    },
  })

  const toggleCheckMutation = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) => {
      if (!uid || !listId) {
        throw new Error('Usuário não autenticado ou lista não selecionada')
      }
      return toggleItem(uid, listId, id, checked)
    },
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ['items', uid, listId] })
      const previousItems = queryClient.getQueryData(['items', uid, listId])
      queryClient.setQueryData(['items', uid, listId], (old: Item[]) =>
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
      if (!uid || !listId) {
        throw new Error('Usuário não autenticado ou lista não selecionada')
      }
      return deleteItem(uid, listId, id)
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

  // Contadores
  const totalItems = items.length
  const checkedItems = items.filter(item => item.checked).length
  const uncheckedItems = totalItems - checkedItems

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
    totalItems,
    checkedItems,
    uncheckedItems,
  }
}
