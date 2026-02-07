import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../../shared/lib/supabase'
import { User } from '../../../shared/types'

export interface AuthError {
  code?: string
  message: string
  status?: number
}

export interface SignUpResult {
  success: boolean
  user?: User
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Named export para Fast Refresh compatível
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erro ao verificar sessão:', error)
        setLoading(false)
        return
      }
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        })
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Erro ao verificar sessão:', error)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Validar inputs
    if (!email || !email.includes('@')) {
      throw new Error('Por favor, insira um email válido')
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      })

      if (error) {
        const errorCode = (error as any).code || ''
        const errorStatus = error.status

        // Log detalhado para debug (sem senha)
        console.error('Erro no login:', {
          status: errorStatus,
          message: error.message,
          code: errorCode,
        })

        // Verificar se é erro de configuração
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          const authError: AuthError = {
            code: 'SUPABASE_NOT_CONFIGURED',
            message: 'Supabase não configurado. Configure as variáveis de ambiente no arquivo .env',
            status: errorStatus,
          }
          throw authError
        }


        // Tratar erro: credenciais inválidas
        if (errorCode === 'invalid_credentials' || error.message.includes('Invalid login credentials')) {
          const authError: AuthError = {
            code: 'invalid_credentials',
            message: 'Email ou senha inválidos.',
            status: errorStatus,
          }
          throw authError
        }

        // Outros erros 400
        if (errorStatus === 400) {
          const authError: AuthError = {
            code: errorCode || 'LOGIN_ERROR',
            message: error.message || 'Email ou senha inválidos',
            status: errorStatus,
          }
          throw authError
        }

        // Outros erros
        const authError: AuthError = {
          code: errorCode || 'UNKNOWN_ERROR',
          message: error.message || 'Erro ao fazer login. Tente novamente.',
          status: errorStatus,
        }
        throw authError
      }
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
        })
      }
    } catch (err: any) {
      // Se já é um AuthError, re-throw
      if (err.code && err.message) {
        throw err
      }
      if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        const authError: AuthError = {
          code: 'SUPABASE_NOT_CONFIGURED',
          message: 'Supabase não configurado. Configure as variáveis de ambiente no arquivo .env',
        }
        throw authError
      }
      // Converter erro genérico para AuthError
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Erro ao fazer login. Tente novamente.',
      }
      throw authError
    }
  }

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    // Validar inputs
    if (!email || !email.includes('@')) {
      const authError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: 'Por favor, insira um email válido',
      }
      throw authError
    }
    if (!password || password.length < 6) {
      const authError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: 'A senha deve ter pelo menos 6 caracteres',
      }
      throw authError
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
      })

      if (error) {
        const errorCode = (error as any).code || ''
        const errorStatus = error.status

        // Log detalhado para debug (sem senha)
        console.error('Erro no cadastro:', {
          status: errorStatus,
          message: error.message,
          code: errorCode,
        })

        // Verificar se é erro de configuração
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          const authError: AuthError = {
            code: 'SUPABASE_NOT_CONFIGURED',
            message: 'Supabase não configurado. Configure as variáveis de ambiente no arquivo .env',
            status: errorStatus,
          }
          throw authError
        }

        // Tratar erro específico: rate limit de emails
        if (errorCode === 'over_email_send_rate_limit' || error.message.includes('email rate limit exceeded') || errorStatus === 429) {
          const authError: AuthError = {
            code: 'over_email_send_rate_limit',
            message: 'Limite de emails atingido. Aguarde alguns minutos ou desative "Confirm email" no Supabase (modo DEV).',
            status: errorStatus,
          }
          throw authError
        }

        // Tratar erro: usuário já cadastrado
        if (errorCode === 'user_already_registered' || error.message.includes('User already registered')) {
          const authError: AuthError = {
            code: 'user_already_registered',
            message: 'Este email já está cadastrado. Tente fazer login.',
            status: errorStatus,
          }
          throw authError
        }

        // Tratar erro: senha muito curta
        if (error.message.includes('Password should be at least')) {
          const authError: AuthError = {
            code: 'PASSWORD_TOO_SHORT',
            message: 'A senha deve ter pelo menos 6 caracteres',
            status: errorStatus,
          }
          throw authError
        }

        // Outros erros 400
        if (errorStatus === 400) {
          const authError: AuthError = {
            code: errorCode || 'SIGNUP_ERROR',
            message: error.message || 'Erro ao criar conta. Verifique os dados e tente novamente.',
            status: errorStatus,
          }
          throw authError
        }

        // Outros erros
        const authError: AuthError = {
          code: errorCode || 'UNKNOWN_ERROR',
          message: error.message || 'Erro ao criar conta. Tente novamente.',
          status: errorStatus,
        }
        throw authError
      }
      
      // Sucesso: usuário criado e sessão ativa
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
        })
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
        }
      }

      // Caso inesperado
      const authError: AuthError = {
        code: 'SIGNUP_UNEXPECTED',
        message: 'Erro inesperado ao criar conta. Tente novamente.',
      }
      throw authError
    } catch (err: any) {
      // Se já é um AuthError, re-throw
      if (err.code && err.message && err.status !== undefined) {
        throw err
      }
      if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        const authError: AuthError = {
          code: 'SUPABASE_NOT_CONFIGURED',
          message: 'Supabase não configurado. Configure as variáveis de ambiente no arquivo .env',
        }
        throw authError
      }
      // Converter erro genérico para AuthError
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Erro ao criar conta. Tente novamente.',
      }
      throw authError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const resendConfirmation = async (email: string) => {
    // Em dev mode, não permitir resend (evita rate limit)
    if (import.meta.env.VITE_DEV_NO_EMAIL_CONFIRMATION === 'true') {
      const authError: AuthError = {
        code: 'DEV_MODE_NO_RESEND',
        message: 'Em modo DEV, desative "Confirm email" no Supabase ao invés de reenviar emails.',
      }
      throw authError
    }

    if (!email || !email.includes('@')) {
      throw new Error('Por favor, insira um email válido')
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    })

    if (error) {
      const errorCode = (error as any).code || ''
      
      if (errorCode === 'over_email_send_rate_limit' || error.status === 429) {
        const authError: AuthError = {
          code: 'over_email_send_rate_limit',
          message: 'Limite de emails atingido. Aguarde alguns minutos ou desative "Confirm email" no Supabase (modo DEV).',
          status: error.status,
        }
        throw authError
      }

      const authError: AuthError = {
        code: errorCode || 'RESEND_ERROR',
        message: error.message || 'Erro ao reenviar email. Tente novamente.',
        status: error.status,
      }
      throw authError
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
