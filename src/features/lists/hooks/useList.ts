import { useQuery } from '@tanstack/react-query'
import { MarketList } from '../types'

// TODO: Implementar serviço real quando backend estiver pronto
async function getListById(_id: string): Promise<MarketList | null> {
  // Mock temporário - retorna null (não encontrado)
  // _id prefixado com _ para evitar warning de variável não usada
  return null
}

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
      return getListById(id)
    },
    enabled: !!id,
    retry: false,
  })

  return { 
    list, 
    isLoading, 
    error,
    isNotFound: !isLoading && !error && !list && !!id,
  }
}
