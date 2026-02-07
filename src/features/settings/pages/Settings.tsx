import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthProvider'
import toast from 'react-hot-toast'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`

const Button = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-1px);
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
`

const Section = styled.section`
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`

const SettingLabel = styled.div`
  flex: 1;
`

const SettingName = styled.div`
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`

const SettingDescription = styled.div`
  font-size: 0.85rem;
  color: var(--color-text-light);
`

const Toggle = styled.button<{ $active: boolean }>`
  width: 50px;
  height: 28px;
  background: ${props => (props.$active ? 'var(--color-primary)' : 'var(--color-border)')};
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${props => (props.$active ? '24px' : '2px')};
    transition: left 0.2s;
  }
`

const DangerButton = styled.button`
  padding: var(--spacing-md);
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`

function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleExport = () => {
    // Implementar exportação de dados
    toast.success('Exportação em desenvolvimento')
  }

  const handleImport = () => {
    // Implementar importação de dados
    toast.success('Importação em desenvolvimento')
  }

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      // Implementar limpeza de dados
      toast.success('Limpeza em desenvolvimento')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <Container>
      <Header>
        <Button onClick={() => navigate('/home')}>← Voltar</Button>
        <Title>Configurações</Title>
      </Header>

      <Section>
        <SectionTitle>Conta</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingName>Email</SettingName>
            <SettingDescription>{user?.email}</SettingDescription>
          </SettingLabel>
        </SettingItem>
        <SettingItem>
          <SettingLabel>
            <SettingName>Sair da conta</SettingName>
            <SettingDescription>Fazer logout da sua conta</SettingDescription>
          </SettingLabel>
          <DangerButton onClick={handleSignOut}>Sair</DangerButton>
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>Aparência</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingName>Tema escuro</SettingName>
            <SettingDescription>Alternar entre tema claro e escuro</SettingDescription>
          </SettingLabel>
          <Toggle $active={theme === 'dark'} onClick={handleThemeToggle} />
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>Dados</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingName>Exportar dados</SettingName>
            <SettingDescription>Baixar seus dados em formato JSON</SettingDescription>
          </SettingLabel>
          <Button onClick={handleExport}>Exportar</Button>
        </SettingItem>
        <SettingItem>
          <SettingLabel>
            <SettingName>Importar dados</SettingName>
            <SettingDescription>Restaurar dados de um backup</SettingDescription>
          </SettingLabel>
          <Button onClick={handleImport}>Importar</Button>
        </SettingItem>
        <SettingItem>
          <SettingLabel>
            <SettingName>Limpar todos os dados</SettingName>
            <SettingDescription>Deletar todas as listas e itens permanentemente</SettingDescription>
          </SettingLabel>
          <DangerButton onClick={handleClearData}>Limpar</DangerButton>
        </SettingItem>
      </Section>
    </Container>
  )
}

export default Settings
