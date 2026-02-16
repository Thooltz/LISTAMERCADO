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
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 20s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }
`

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: 20px;
  }
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

const LogoIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
`

const LogoTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const LogoSubtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-top: 8px;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 12px;
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  font-size: 1rem;
  font-weight: ${props => (props.$active ? '600' : '500')};
  color: ${props => (props.$active ? '#667eea' : '#999')};
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(102, 126, 234, 0.2)' : 'none'};

  &:active {
    transform: scale(0.98);
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
`

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fafafa;
  color: #1a1a1a;

  &:focus {
    border-color: #667eea;
    outline: none;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`

const Button = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: ${props => (props.$loading ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$loading ? 0.7 : 1)};
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  min-height: 52px;

  &:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fee;
  color: #e74c3c;
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid #fcc;
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
