import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/AuthProvider'
import { MarketList } from '../types'
import toast from 'react-hot-toast'

// TODO: Implementar serviço real de listas quando backend estiver pronto
// Por enquanto, retorna array vazio para compilar
async function getLists(): Promise<MarketList[]> {
  // Mock temporário - retorna array vazio
  return []
}

async function createList(title: string): Promise<MarketList> {
  // Mock temporário - retorna lista fake
  return {
    id: `temp-${Date.now()}`,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

async function renameList(id: string, title: string): Promise<MarketList> {
  // Mock temporário
  return {
    id,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

async function deleteList(id: string): Promise<void> {
  // Mock temporário
  console.log('TODO: Implementar deleteList', id)
}

export function useLists() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: lists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lists', user?.uid],
    queryFn: getLists,
    enabled: !!user,
    staleTime: 1000 * 30,
  })

  const createMutation = useMutation({
    mutationFn: (title: string) => createList(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] })
      toast.success('Lista criada com sucesso!')
    },
    onError: (error: any) => {
      console.error('Erro ao criar lista:', error)
      toast.error(error.message || 'Erro ao criar lista')
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      renameList(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] })
      queryClient.invalidateQueries({ queryKey: ['list'] })
      toast.success('Lista renomeada!')
    },
    onError: (error: any) => {
      console.error('Erro ao renomear lista:', error)
      toast.error(error.message || 'Erro ao renomear lista')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] })
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
