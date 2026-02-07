import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { itemService } from '../services/itemService'
import { CreateItemInput, UpdateItemInput } from '../../../shared/types'
import toast from 'react-hot-toast'

export function useItems(listId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items', listId],
    queryFn: () => {
      if (!listId) {
        throw new Error('ID da lista é obrigatório')
      }
      return itemService.getItemsByList(listId)
    },
    enabled: !!listId && !!user,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('não encontrada')) return false
      if (error?.message?.includes('não autenticado') || error?.message?.includes('Sessão expirada')) return false
      return failureCount < 2
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateItemInput) => itemService.addItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] })
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] })
      toast.success('Item adicionado!')
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar item:', error)
      toast.error(error.message || 'Erro ao adicionar item')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateItemInput }) =>
      itemService.updateItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] })
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] })
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar item:', error)
      toast.error(error.message || 'Erro ao atualizar item')
    },
  })

  const toggleCheckMutation = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      itemService.updateItem(id, { checked }),
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ['items', listId] })
      const previousItems = queryClient.getQueryData(['items', listId])
      queryClient.setQueryData(['items', listId], (old: any[]) =>
        old?.map(item => (item.id === id ? { ...item, checked } : item))
      )
      return { previousItems }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['items', listId], context.previousItems)
      }
      toast.error('Erro ao atualizar item')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] })
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] })
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
