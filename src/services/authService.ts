import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth'
import { auth } from '../firebase'

export interface User {
  uid: string
  email: string | null
}

/**
 * Converte erro do Firebase em mensagem amigável
 */
function getFirebaseErrorMessage(error: AuthError): string {
  const code = error.code

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este email já está cadastrado. Tente fazer login.'
    case 'auth/invalid-email':
      return 'Por favor, insira um email válido.'
    case 'auth/operation-not-allowed':
      return 'Operação não permitida. Entre em contato com o suporte.'
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.'
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada. Entre em contato com o suporte.'
    case 'auth/user-not-found':
      return 'Email ou senha inválidos.'
    case 'auth/wrong-password':
      return 'Email ou senha inválidos.'
    case 'auth/invalid-credential':
      return 'Email ou senha inválidos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.'
    default:
      return error.message || 'Erro ao realizar operação. Tente novamente.'
  }
}

/**
 * Registra um novo usuário
 */
export async function register(email: string, password: string): Promise<User> {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Por favor, insira um email válido')
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    )

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    }
  } catch (error: any) {
    if (error.code) {
      throw new Error(getFirebaseErrorMessage(error))
    }
    throw error
  }
}

/**
 * Faz login do usuário
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Por favor, insira um email válido')
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    )

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    }
  } catch (error: any) {
    if (error.code) {
      throw new Error(getFirebaseErrorMessage(error))
    }
    throw error
  }
}

/**
 * Faz logout do usuário
 */
export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer logout')
  }
}

/**
 * Obtém o usuário atual (opcional, útil para verificação)
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}
