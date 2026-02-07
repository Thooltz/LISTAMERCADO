import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, AuthError } from '../context/AuthProvider'
import { isSupabaseConfigured } from '../../../shared/lib/supabase'
import toast from 'react-hot-toast'
import styled from 'styled-components'

const DEV_NO_EMAIL = import.meta.env.VITE_DEV_NO_EMAIL_CONFIRMATION === 'true'

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

const WarningMessage = styled.div`
  padding: var(--spacing-md);
  background: #fef3c7;
  color: #92400e;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
  border-left: 4px solid #f59e0b;
`

const WarningTitle = styled.div`
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
`

const DevModeBanner = styled.div`
  padding: var(--spacing-md);
  background: #d1fae5;
  border: 2px solid #10b981;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.85rem;
  color: #065f46;
`

const DevModeTitle = styled.div`
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
`

const Checklist = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: var(--spacing-sm) 0;
`

const ChecklistItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  font-size: 0.85rem;
`

const EmailNotConfirmedAlert = styled.div`
  padding: var(--spacing-lg);
  background: #fee2e2;
  border: 2px solid #ef4444;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
`

const AlertTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: var(--spacing-md);
  color: #991b1b;
`

const StepsList = styled.ol`
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-lg);
`

const Step = styled.li`
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
`

const LinkButton = styled.a`
  display: inline-block;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #3b82f6;
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [cooldown, setCooldown] = useState(0) // Cooldown após signup/resend
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const submitRef = useRef(false) // Prevenir múltiplos submits

  // Cooldown após signup/resend para evitar rate limit
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setTimeout(() => {
      setCooldown(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir múltiplos submits
    if (submitRef.current || loading || cooldown > 0) {
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
    
    // Verificar se Supabase está configurado
    if (!isSupabaseConfigured()) {
      setError({
        code: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase não está configurado. Por favor, configure as variáveis de ambiente no arquivo .env. Veja o arquivo SETUP.md para instruções.',
      })
      toast.error('Configure o Supabase primeiro')
      return
    }

    submitRef.current = true
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email.trim(), password)
        toast.success('Login realizado com sucesso!')
        navigate('/home')
      } else {
        await signUp(email.trim(), password)
        toast.success('Conta criada com sucesso!')
        navigate('/home')
      }
    } catch (err: any) {
      // Tratar erros específicos
      if (err.code === 'over_email_send_rate_limit') {
        // Rate limit: ativar cooldown de 60s
        setCooldown(60)
        setError({
          ...err,
          message: 'Limite de emails atingido. Aguarde alguns minutos ou desative "Confirm email" no Supabase (modo DEV).',
        })
        toast.error('Limite de emails atingido. Aguarde alguns minutos.')
      } else {
        setError(err)
        toast.error(err.message || (isLogin ? 'Erro ao fazer login. Tente novamente.' : 'Erro ao criar conta. Tente novamente.'))
      }
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
          {DEV_NO_EMAIL && (
            <DevModeBanner>
              <DevModeTitle>🔧 Modo DEV: Sem Confirmação de Email</DevModeTitle>
              <div>
                Para desenvolvimento local, a confirmação de email deve estar <strong>desativada</strong> no Supabase.
                <br />
                <br />
                <strong>Checklist:</strong>
                <Checklist>
                  <ChecklistItem>
                    <input type="checkbox" disabled checked={false} />
                    <span>Confirm email = OFF (Supabase Dashboard → Authentication → Providers → Email)</span>
                  </ChecklistItem>
                  <ChecklistItem>
                    <input type="checkbox" disabled checked={false} />
                    <span>Provider Email = Enabled</span>
                  </ChecklistItem>
                </Checklist>
                <br />
                <strong>Como desativar:</strong> Supabase Dashboard → Authentication → Providers → Email → "Confirm email" OFF
              </div>
            </DevModeBanner>
          )}

          {cooldown > 0 && (
            <WarningMessage>
              <WarningTitle>⏱️ Aguarde antes de tentar novamente</WarningTitle>
              <div>
                Cooldown ativo: {cooldown} segundos restantes
                <br />
                <small>Isso evita rate limit de emails do Supabase.</small>
              </div>
            </WarningMessage>
          )}

          {!isSupabaseConfigured() && (
            <WarningMessage>
              <WarningTitle>⚠️ Supabase não configurado</WarningTitle>
              <div>
                Para usar o app, você precisa configurar o Supabase. Crie um arquivo .env na raiz do projeto com suas credenciais.
                <br />
                <br />
                Veja o arquivo <strong>SETUP.md</strong> para instruções detalhadas.
              </div>
            </WarningMessage>
          )}

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
            disabled={loading || !isSupabaseConfigured() || cooldown > 0}
          >
            {loading 
              ? 'Carregando...' 
              : cooldown > 0 
                ? `Aguarde ${cooldown}s` 
                : isLogin 
                  ? 'Entrar' 
                  : 'Criar conta'}
          </Button>
          
          {!isSupabaseConfigured() && (
            <Button
              type="button"
              onClick={() => navigate('/setup')}
              style={{ marginTop: '8px', background: 'var(--color-warning)' }}
            >
              ⚙️ Ir para Configuração
            </Button>
          )}
        </Form>
      </Card>
    </Container>
  )
}

export default Auth
