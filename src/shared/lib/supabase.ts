import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar se as variáveis estão configuradas corretamente
const isValidUrl = (url: string | undefined): boolean => {
  if (!url || typeof url !== 'string') return false
  if (url.trim() === '') return false
  if (url.includes('placeholder') || url.includes('sua_url') || url.includes('seu-projeto')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.includes('supabase.co')
  } catch {
    return false
  }
}

const isValidKey = (key: string | undefined): boolean => {
  if (!key || typeof key !== 'string') return false
  if (key.trim() === '') return false
  if (key.includes('placeholder') || key.includes('sua_chave') || key.includes('sua_chave_anon')) return false
  // Chave anon do Supabase pode ter diferentes formatos (sb_publishable_ ou eyJ...)
  // Aceita chaves com pelo menos 30 caracteres
  return key.length >= 30
}

// Verificar se está configurado
export const isSupabaseConfigured = (): boolean => {
  return isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)
}

// Singleton pattern para evitar múltiplas instâncias durante HMR
const getSupabaseClient = (): SupabaseClient => {
  // Em desenvolvimento, usar globalThis para persistir durante HMR
  if (import.meta.env.DEV && typeof globalThis !== 'undefined') {
    const globalKey = '__supabase_client__'
    if (!(globalKey in globalThis)) {
      if (isSupabaseConfigured() && supabaseUrl && supabaseAnonKey) {
        (globalThis as any)[globalKey] = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          },
        })
      } else {
        (globalThis as any)[globalKey] = createClient('https://placeholder.supabase.co', 'placeholder-key', {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        })
      }
    }
    return (globalThis as any)[globalKey]
  }

  // Em produção ou primeira execução
  if (isSupabaseConfigured() && supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }

  return createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export const supabase: SupabaseClient = getSupabaseClient()

// Função para obter informações de diagnóstico (sem expor segredos)
export const getConfigDiagnostics = () => {
  const urlStatus = isValidUrl(supabaseUrl)
  const keyStatus = isValidKey(supabaseAnonKey)
  
  return {
    urlConfigured: urlStatus,
    keyConfigured: keyStatus,
    urlPreview: supabaseUrl 
      ? `${supabaseUrl.substring(0, 20)}...${supabaseUrl.substring(supabaseUrl.length - 10)}`
      : 'Não configurado',
    keyPreview: supabaseAnonKey && supabaseAnonKey.length > 10
      ? `${supabaseAnonKey.substring(0, 6)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 4)}`
      : 'Não configurado',
  }
}
