import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { listService } from '../services/listService'
import toast from 'react-hot-toast'

export function useLists() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: lists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lists', user?.id],
    queryFn: () => listService.getLists(),
    enabled: !!user,
    staleTime: 1000 * 30,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('não encontrada')) return false
      if (error?.message?.includes('não autenticado') || error?.message?.includes('Sessão expirada')) return false
      return failureCount < 2
    },
  })

  const createMutation = useMutation({
    mutationFn: (title: string) => listService.createList(title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] })
      toast.success('Lista criada com sucesso!')
      return data
    },
    onError: (error: any) => {
      console.error('Erro ao criar lista:', error)
      if (error?.message?.includes('não encontrada')) {
        toast.error('Tabela não encontrada. Execute o SQL de criação no Supabase.', { duration: 8000 })
      } else if (error?.message?.includes('não autenticado') || error?.message?.includes('Sessão expirada')) {
        toast.error('Sessão expirada. Faça login novamente.')
      } else {
        toast.error(error.message || 'Erro ao criar lista')
      }
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      listService.renameList(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['list'] })
      toast.success('Lista renomeada!')
    },
    onError: (error: any) => {
      console.error('Erro ao renomear lista:', error)
      toast.error(error.message || 'Erro ao renomear lista')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => listService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] })
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
