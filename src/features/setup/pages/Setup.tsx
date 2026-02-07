import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, getConfigDiagnostics } from '../../../shared/lib/supabase'
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
  max-width: 700px;
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
  text-align: center;
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xl);
  text-align: center;
`

const Section = styled.section`
  margin-bottom: var(--spacing-xl);
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`

const StepList = styled.ol`
  list-style: decimal;
  padding-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
`

const Step = styled.li`
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
  color: var(--color-text);
`

const CodeBlock = styled.pre`
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  overflow-x: auto;
  font-size: 0.9rem;
  margin: var(--spacing-sm) 0;
  color: var(--color-text);
`

const StatusCard = styled.div<{ $success: boolean }>`
  padding: var(--spacing-md);
  background: ${props => (props.$success ? '#d1fae5' : '#fee2e2')};
  border: 2px solid ${props => (props.$success ? '#10b981' : '#ef4444')};
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
`

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  
  &:last-child {
    margin-bottom: 0;
  }
`

const StatusIcon = styled.span`
  font-size: 1.2rem;
`

const StatusText = styled.span`
  color: var(--color-text);
  font-weight: 500;
`

const Button = styled.button`
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: var(--spacing-md);

  &:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const SecondaryButton = styled.button`
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
  margin-top: var(--spacing-sm);

  &:hover {
    background: var(--color-bg-tertiary);
  }
`

const Link = styled.a`
  color: var(--color-primary);
  text-decoration: underline;
  
  &:hover {
    color: var(--color-primary-dark);
  }
`

function Setup() {
  const navigate = useNavigate()
  const [diagnostics, setDiagnostics] = useState(getConfigDiagnostics())
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured())

  const checkConfiguration = () => {
    const newDiagnostics = getConfigDiagnostics()
    const newIsConfigured = isSupabaseConfigured()
    setDiagnostics(newDiagnostics)
    setIsConfigured(newIsConfigured)
    
    if (newIsConfigured) {
      // Recarregar a página para que o Vite carregue as novas variáveis
      window.location.reload()
    }
  }

  useEffect(() => {
    // Verificar a cada 2 segundos se foi configurado
    const interval = setInterval(() => {
      if (!isConfigured) {
        checkConfiguration()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isConfigured])

  if (isConfigured) {
    return (
      <Container>
        <Card>
          <StatusCard $success={true}>
            <StatusItem>
              <StatusIcon>✅</StatusIcon>
              <StatusText>Supabase configurado com sucesso!</StatusText>
            </StatusItem>
          </StatusCard>
          <Button onClick={() => navigate('/')}>
            Ir para o App
          </Button>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <Card>
        <Title>⚙️ Configuração Necessária</Title>
        <Subtitle>
          O SmartList precisa ser configurado antes de usar. Siga os passos abaixo.
        </Subtitle>

        <StatusCard $success={false}>
          <StatusItem>
            <StatusIcon>{diagnostics.urlConfigured ? '✅' : '❌'}</StatusIcon>
            <StatusText>
              URL do Supabase: {diagnostics.urlConfigured ? 'Configurado' : 'Não configurado'}
              {diagnostics.urlPreview !== 'Não configurado' && (
                <span style={{ marginLeft: '8px', opacity: 0.7, fontSize: '0.85rem' }}>
                  ({diagnostics.urlPreview})
                </span>
              )}
            </StatusText>
          </StatusItem>
          <StatusItem>
            <StatusIcon>{diagnostics.keyConfigured ? '✅' : '❌'}</StatusIcon>
            <StatusText>
              Chave Anon: {diagnostics.keyConfigured ? 'Configurado' : 'Não configurado'}
              {diagnostics.keyPreview !== 'Não configurado' && (
                <span style={{ marginLeft: '8px', opacity: 0.7, fontSize: '0.85rem' }}>
                  ({diagnostics.keyPreview})
                </span>
              )}
            </StatusText>
          </StatusItem>
        </StatusCard>

        <Section>
          <SectionTitle>📋 Passo a Passo</SectionTitle>
          <StepList>
            <Step>
              <strong>Crie uma conta no Supabase</strong>
              <br />
              Acesse <Link href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</Link> e crie uma conta gratuita.
            </Step>
            <Step>
              <strong>Crie um novo projeto</strong>
              <br />
              No dashboard do Supabase, clique em "New Project", escolha um nome e uma senha para o banco de dados.
            </Step>
            <Step>
              <strong>Copie suas credenciais</strong>
              <br />
              Vá em <strong>Settings → API</strong> e copie:
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li><strong>Project URL</strong> (ex: https://xxxxx.supabase.co)</li>
                <li><strong>anon public</strong> key (chave longa)</li>
              </ul>
            </Step>
            <Step>
              <strong>Crie o arquivo .env</strong>
              <br />
              Na raiz do projeto (mesma pasta do <code>package.json</code>), crie um arquivo chamado <code>.env</code> e cole:
              <CodeBlock>{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui`}</CodeBlock>
              <strong>Substitua</strong> pelos valores que você copiou do Supabase.
            </Step>
            <Step>
              <strong>Configure o banco de dados</strong>
              <br />
              No Supabase, vá em <strong>SQL Editor</strong>, clique em <strong>New Query</strong>, abra o arquivo <code>database.sql</code> deste projeto, cole todo o conteúdo e clique em <strong>Run</strong>.
            </Step>
            <Step>
              <strong>Reinicie o servidor</strong>
              <br />
              No terminal onde o servidor está rodando, pressione <strong>Ctrl+C</strong> para parar, depois execute <strong>npm run dev</strong> novamente.
            </Step>
            <Step>
              <strong>Clique em "Verificar Configuração"</strong>
              <br />
              Após reiniciar, volte aqui e clique no botão abaixo para verificar se está tudo certo.
            </Step>
          </StepList>
        </Section>

        <Button onClick={checkConfiguration}>
          🔄 Verificar Configuração
        </Button>
        <SecondaryButton onClick={() => window.open('https://supabase.com', '_blank')}>
          Abrir Supabase
        </SecondaryButton>
      </Card>
    </Container>
  )
}

export default Setup
