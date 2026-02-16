import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, AuthError } from '../context/AuthProvider'
import toast from 'react-hot-toast'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
`

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
`

const Tabs = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-border);
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: var(--spacing-md);
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: ${props => (props.$active ? '600' : '400')};
  color: ${props => (props.$active ? 'var(--color-primary)' : 'var(--color-text-light)')};
  border-bottom: 2px solid ${props => (props.$active ? 'var(--color-primary)' : 'transparent')};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;
  background: var(--color-bg);
  color: var(--color-text);

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-lighter);
  }
`

const Button = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: background 0.2s, transform 0.2s;
  cursor: ${props => (props.$loading ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$loading ? 0.7 : 1)};

  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  background: #fee2e2;
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
`



function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const submitRef = useRef(false) // Prevenir múltiplos submits

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir múltiplos submits
    if (submitRef.current || loading) {
      return
    }

    setError(null)
    
    // Validação básica
    if (!email.trim()) {
      setError({ code: 'VALIDATION_ERROR', message: 'Por favor, insira seu email' })
      return
    }

    if (!email.includes('@')) {
      setError({ code: 'VALIDATION_ERROR', message: 'Por favor, insira um email válido' })
      return
    }

    if (!password || password.length < 6) {
      setError({ code: 'VALIDATION_ERROR', message: 'A senha deve ter pelo menos 6 caracteres' })
      return
    }

    submitRef.current = true
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email.trim(), password)
        toast.success('Login realizado com sucesso!')
        navigate('/lists')
      } else {
        await signUp(email.trim(), password)
        toast.success('Conta criada com sucesso!')
        navigate('/lists')
      }
    } catch (err: any) {
      setError({ code: err.code, message: err.message || 'Erro ao realizar operação' })
      toast.error(err.message || (isLogin ? 'Erro ao fazer login. Tente novamente.' : 'Erro ao criar conta. Tente novamente.'))
    } finally {
      setLoading(false)
      submitRef.current = false
    }
  }


  return (
    <Container>
      <Card>
        <Tabs>
          <Tab $active={isLogin} onClick={() => setIsLogin(true)}>
            Entrar
          </Tab>
          <Tab $active={!isLogin} onClick={() => setIsLogin(false)}>
            Cadastrar
          </Tab>
        </Tabs>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>{error.message}</ErrorMessage>
          )}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={6}
          />

          <Button 
            type="submit" 
            $loading={loading} 
            disabled={loading}
          >
            {loading 
              ? 'Carregando...' 
              : isLogin 
                ? 'Entrar' 
                : 'Criar conta'}
          </Button>
        </Form>
      </Card>
    </Container>
  )
}

export default Auth
