import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, AuthError } from '../context/AuthProvider'
import toast from 'react-hot-toast'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--color-bg);
  background-image: var(--color-bg-gradient-vibrant);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow-x: hidden;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @media (max-width: 480px) {
    padding: 16px;
    align-items: flex-start;
    padding-top: max(20px, env(safe-area-inset-top, 20px));
    padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
    animation: pulse 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -30%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
    animation: pulse 25s ease-in-out infinite reverse;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }
`

const Card = styled.div`
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 32px;
  padding: 48px;
  box-shadow: var(--shadow-2xl), 0 0 0 1px var(--color-border);
  position: relative;
  z-index: 1;
  animation: scaleIn 0.5s ease-out;
  border: 1px solid var(--color-border);
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: 24px;
    max-width: 100%;
    margin: 0;
    width: 100%;
    box-shadow: var(--shadow-2xl), 0 0 0 1px var(--color-border);
  }
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`

const LogoIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }
`

const LogoTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`

const LogoSubtitle = styled.p`
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-top: 8px;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-top: 6px;
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: var(--color-surface-elevated);
  backdrop-filter: blur(10px);
  padding: 6px;
  border-radius: 16px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);

  @media (max-width: 480px) {
    margin-bottom: 24px;
    padding: 5px;
    gap: 6px;
  }
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px;
  background: ${props => props.$active ? 'var(--color-primary-gradient)' : 'transparent'};
  border: none;
  font-size: 1rem;
  font-weight: ${props => (props.$active ? '700' : '500')};
  color: ${props => (props.$active ? 'white' : 'var(--color-text-secondary)')};
  border-radius: 12px;
  transition: all var(--transition-base);
  cursor: pointer;
  box-shadow: ${props => props.$active ? 'var(--shadow-colored)' : 'none'};
  position: relative;

  &:hover:not(:disabled) {
    ${props => !props.$active && 'color: var(--color-text);'}
  }

  &:active {
    transform: scale(0.96);
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 480px) {
    gap: 18px;
  }
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
`

const Input = styled.input`
  width: 100%;
  padding: 18px;
  border: 2px solid var(--color-border);
  border-radius: 16px;
  font-size: 16px;
  transition: all var(--transition-base);
  background: var(--color-surface-elevated);
  backdrop-filter: blur(10px);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 56px;
  box-sizing: border-box;

  &:focus {
    border-color: var(--color-primary);
    outline: none;
    background: var(--color-bg-tertiary);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(34, 197, 94, 0.2);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: var(--color-text-secondary);
  }

  @media (max-width: 480px) {
    padding: 18px;
    min-height: 60px;
    border-radius: 16px;
    font-size: 16px;
    border-width: 2.5px;
  }
`

const Button = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 18px;
  background: var(--color-primary-gradient);
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  border: none;
  border-radius: 16px;
  transition: all var(--transition-bounce);
  cursor: ${props => (props.$loading ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$loading ? 0.7 : 1)};
  box-shadow: var(--shadow-colored);
  min-height: 56px;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
  touch-action: manipulation;

  @media (max-width: 480px) {
    padding: 20px;
    font-size: 1.1rem;
    min-height: 60px;
    border-radius: 18px;
    box-shadow: var(--shadow-colored-lg);
  }

  &:hover:not(:disabled) {
    background: var(--color-primary-gradient-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-colored-lg);
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active:not(:disabled) {
    background: var(--color-primary-dark);
    transform: scale(0.96) translateY(0);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.5), 0 0 0 4px rgba(34, 197, 94, 0.2);
    
    &::before {
      width: 400px;
      height: 400px;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-danger);
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
`

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const submitRef = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (submitRef.current || loading) {
      return
    }

    setError(null)
    
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
        <Logo>
          <LogoIcon>📝</LogoIcon>
          <LogoTitle>SmartList</LogoTitle>
          <LogoSubtitle>Sua lista de compras inteligente</LogoSubtitle>
        </Logo>

        <Tabs>
          <Tab $active={isLogin} onClick={() => {
            setIsLogin(true)
            setError(null)
          }}>
            Entrar
          </Tab>
          <Tab $active={!isLogin} onClick={() => {
            setIsLogin(false)
            setError(null)
          }}>
            Cadastrar
          </Tab>
        </Tabs>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>{error.message}</ErrorMessage>
          )}

          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={6}
              disabled={loading}
            />
          </InputGroup>

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
