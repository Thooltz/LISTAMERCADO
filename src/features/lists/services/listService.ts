import { supabase } from '../../../shared/lib/supabase'
import { List } from '../../../shared/types'

/**
 * Obtém o user_id da sessão atual do Supabase Auth
 * Usa getSession() que é mais confiável para verificar autenticação
 * @throws Error se não houver sessão válida
 */
async function getCurrentUserId(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    throw new Error('Erro ao verificar sessão. Faça login novamente.')
  }
  
  if (!session || !session.user) {
    throw new Error('Usuário não autenticado. Faça login novamente.')
  }
  
  return session.user.id
}

/**
 * Trata erros do Supabase de forma específica
 * Diferencia entre 404 (tabela não existe), 401 (não autenticado), 403 (sem permissão)
 */
function handleSupabaseError(error: any, tableName: string = 'lists'): never {
  const errorCode = error?.code || ''
  const errorMessage = String(error?.message || error?.details || error?.hint || '')
  const errorStatus = error?.status || (error as any)?.httpStatus || (error as any)?.response?.status

  // Erro 404: Tabela não encontrada (PGRST205, PGRST116)
  const isTableNotFound = 
    errorCode === 'PGRST205' || 
    errorCode === 'PGRST116' || 
    errorCode === '42P01' ||    
    errorStatus === 404 ||
    errorMessage.includes('Could not find the table') ||
    errorMessage.includes('in the schema cache') ||
    (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
    (errorMessage.includes('not found') && errorMessage.includes('table'))

  if (isTableNotFound) {
    throw new Error(
      `Tabela public.${tableName} não encontrada. Execute o SQL de criação e recarregue o schema cache.`
    )
  }

  // Erro 401: Não autenticado (JWT inválido/expirado)
  const isUnauthorized = 
    errorCode === 'PGRST301' || 
    errorCode === 'PGRST302' || 
    errorStatus === 401 ||
    errorMessage.includes('JWT') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid token') ||
    errorMessage.includes('not authenticated')

  if (isUnauthorized) {
    throw new Error('Sessão expirada ou inválida. Faça login novamente.')
  }

  // Erro 403: Sem permissão (RLS bloqueou)
  const isForbidden = 
    errorCode === '42501' || 
    errorCode === 'PGRST301' || 
    errorStatus === 403 ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('row-level security') ||
    errorMessage.includes('policy violation')

  if (isForbidden) {
    throw new Error('Sem permissão para acessar este recurso. Verifique as policies RLS no Supabase.')
  }

  // Outros erros - lançar com mensagem original
  throw new Error(errorMessage || `Erro ao acessar ${tableName}: ${errorCode || 'Erro desconhecido'}`)
}

export const listService = {
  /**
   * Busca todas as listas do usuário atual
   * RLS garante que apenas listas do usuário autenticado sejam retornadas
   */
  async getLists(): Promise<List[]> {
    try {
      await getCurrentUserId()

      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'lists')
      }

      return data || []
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'lists')
      }
      throw err
    }
  },

  /**
   * Busca uma lista específica por ID
   * RLS garante que apenas o dono da lista possa acessá-la
   */
  async getListById(id: string): Promise<List | null> {
    try {
      if (!id) {
        throw new Error('ID da lista é obrigatório')
      }

      await getCurrentUserId()

      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        // Se for erro de "não encontrado" (PGRST116), retornar null
        if (error.code === 'PGRST116' || error.code === '42P01') {
          return null
        }
        handleSupabaseError(error, 'lists')
      }

      return data
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'lists')
      }
      throw err
    }
  },

  /**
   * Cria uma nova lista para o usuário autenticado
   */
  async createList(title: string, items: any[] = []): Promise<List> {
    try {
      const currentUserId = await getCurrentUserId()

      const { data, error } = await supabase
        .from('lists')
        .insert({
          title,
          user_id: currentUserId,
          items: items || [],
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'lists')
      }

      if (!data) {
        throw new Error('Nenhum dado retornado ao criar lista')
      }

      return data
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'lists')
      }
      throw err
    }
  },

  /**
   * Renomeia uma lista (atualiza apenas o título)
   */
  async renameList(id: string, title: string): Promise<List> {
    try {
      if (!id) {
        throw new Error('ID da lista é obrigatório')
      }
      if (!title || !title.trim()) {
        throw new Error('Título da lista é obrigatório')
      }

      await getCurrentUserId()

      const { data, error } = await supabase
        .from('lists')
        .update({ title: title.trim() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'lists')
      }

      if (!data) {
        throw new Error('Lista não encontrada ou você não tem permissão para atualizá-la')
      }

      return data
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'lists')
      }
      throw err
    }
  },

  /**
   * Deleta uma lista
   */
  async deleteList(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID da lista é obrigatório')
      }

      await getCurrentUserId()

      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'lists')
      }
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'lists')
      }
      throw err
    }
  },
}
