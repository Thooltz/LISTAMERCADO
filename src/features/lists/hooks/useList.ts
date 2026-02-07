import { useQuery } from '@tanstack/react-query'
import { listService } from '../services/listService'

export function useList(id: string | undefined) {
  const {
    data: list,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['list', id],
    queryFn: () => {
      if (!id) {
        throw new Error('ID da lista é obrigatório')
      }
      return listService.getListById(id)
    },
    enabled: !!id,
    retry: (failureCount, error: any) => {
      // Não fazer retry se lista não encontrada (404 real)
      if (error?.message?.includes('não encontrada') || error?.code === 'PGRST116') {
        return false
      }
      // Não fazer retry se não autenticado
      if (error?.message?.includes('não autenticado') || error?.message?.includes('Sessão expirada')) {
        return false
      }
      return failureCount < 2
    },
  })

  return { 
    list, 
    isLoading, 
    error,
    isNotFound: !isLoading && !error && !list && !!id, // Só é "não encontrada" se não estiver carregando e realmente não existir
  }
}
