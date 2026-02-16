import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '../../../firebase'
import { register, login, logout, User } from '../../../services/authService'

export interface AuthError {
  code?: string
  message: string
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Named export para Fast Refresh compatível
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Escutar mudanças de autenticação
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await login(email, password)
      // onAuthStateChanged vai atualizar o estado automaticamente
    } catch (error: any) {
      throw error
    }
  }

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    try {
      const newUser = await register(email, password)
      // onAuthStateChanged vai atualizar o estado automaticamente
      return {
        success: true,
        user: newUser,
      }
    } catch (error: any) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await logout()
      // onAuthStateChanged vai atualizar o estado automaticamente
    } catch (error: any) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
