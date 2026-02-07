import { supabase } from '../../../shared/lib/supabase'
import { Item, CreateItemInput, UpdateItemInput } from '../../../shared/types'

/**
 * Obtém o user_id da sessão atual do Supabase Auth
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
 * Trata erros do Supabase
 */
function handleSupabaseError(error: any, tableName: string = 'items'): never {
  const errorCode = error?.code || ''
  const errorMessage = String(error?.message || error?.details || error?.hint || '')
  const errorStatus = error?.status || (error as any)?.httpStatus || (error as any)?.response?.status

  const isTableNotFound = 
    errorCode === 'PGRST205' || 
    errorCode === 'PGRST116' || 
    errorCode === '42P01' ||    
    errorStatus === 404 ||
    errorMessage.includes('Could not find the table') ||
    errorMessage.includes('in the schema cache') ||
    (errorMessage.includes('relation') && errorMessage.includes('does not exist'))

  if (isTableNotFound) {
    throw new Error(
      `Tabela public.${tableName} não encontrada. Execute o SQL de criação e recarregue o schema cache.`
    )
  }

  const isUnauthorized = 
    errorCode === 'PGRST301' || 
    errorCode === 'PGRST302' || 
    errorStatus === 401 ||
    errorMessage.includes('JWT') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid token')

  if (isUnauthorized) {
    throw new Error('Sessão expirada ou inválida. Faça login novamente.')
  }

  const isForbidden = 
    errorCode === '42501' || 
    errorStatus === 403 ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('row-level security')

  if (isForbidden) {
    throw new Error('Sem permissão para acessar este recurso.')
  }

  throw new Error(errorMessage || `Erro ao acessar ${tableName}: ${errorCode || 'Erro desconhecido'}`)
}

export const itemService = {
  /**
   * Busca todos os itens de uma lista
   * RLS garante que apenas itens do usuário autenticado sejam retornados
   */
  async getItemsByList(listId: string): Promise<Item[]> {
    try {
      if (!listId) {
        throw new Error('ID da lista é obrigatório')
      }

      await getCurrentUserId()

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true })

      if (error) {
        handleSupabaseError(error, 'items')
      }

      return data || []
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'items')
      }
      throw err
    }
  },

  /**
   * Adiciona um novo item à lista
   */
  async addItem(input: CreateItemInput): Promise<Item> {
    try {
      if (!input.list_id) {
        throw new Error('ID da lista é obrigatório')
      }
      if (!input.name || !input.name.trim()) {
        throw new Error('Nome do item é obrigatório')
      }

      const currentUserId = await getCurrentUserId()

      const { data, error } = await supabase
        .from('items')
        .insert({
          list_id: input.list_id,
          user_id: currentUserId,
          name: input.name.trim(),
          quantity: input.quantity || 1,
          unit: input.unit || 'un',
          category: input.category || 'Outros',
          checked: false,
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'items')
      }

      if (!data) {
        throw new Error('Nenhum dado retornado ao criar item')
      }

      return data
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'items')
      }
      throw err
    }
  },

  /**
   * Atualiza um item existente
   */
  async updateItem(id: string, input: UpdateItemInput): Promise<Item> {
    try {
      if (!id) {
        throw new Error('ID do item é obrigatório')
      }

      await getCurrentUserId()

      const updateData: any = {}
      if (input.name !== undefined) updateData.name = input.name.trim()
      if (input.quantity !== undefined) updateData.quantity = input.quantity
      if (input.unit !== undefined) updateData.unit = input.unit
      if (input.category !== undefined) updateData.category = input.category
      if (input.price !== undefined) updateData.price = input.price
      if (input.checked !== undefined) updateData.checked = input.checked

      const { data, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'items')
      }

      if (!data) {
        throw new Error('Item não encontrado ou você não tem permissão para atualizá-lo')
      }

      return data
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'items')
      }
      throw err
    }
  },

  /**
   * Remove um item
   */
  async deleteItem(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID do item é obrigatório')
      }

      await getCurrentUserId()

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'items')
      }
    } catch (err: any) {
      if (err && typeof err === 'object' && (err.code || err.message)) {
        handleSupabaseError(err, 'items')
      }
      throw err
    }
  },
}
