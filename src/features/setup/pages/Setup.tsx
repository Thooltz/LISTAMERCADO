import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../../firebase'
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

function Setup() {
  const navigate = useNavigate()
  const [firebaseStatus, setFirebaseStatus] = useState({
    authInitialized: false,
    firestoreInitialized: false,
  })

  useEffect(() => {
    // Verificar se Firebase está inicializado
    try {
      const authInitialized = auth !== null && auth !== undefined
      const firestoreInitialized = db !== null && db !== undefined
      
      setFirebaseStatus({
        authInitialized,
        firestoreInitialized,
      })
    } catch (error) {
      console.error('Erro ao verificar Firebase:', error)
    }
  }, [])

  const isConfigured = firebaseStatus.authInitialized && firebaseStatus.firestoreInitialized

  if (isConfigured) {
    return (
      <Container>
        <Card>
          <StatusCard $success={true}>
            <StatusItem>
              <StatusIcon>✅</StatusIcon>
              <StatusText>Firebase configurado com sucesso!</StatusText>
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
        <Title>⚙️ Configuração Firebase</Title>
        <Subtitle>
          Verificando configuração do Firebase...
        </Subtitle>

        <StatusCard $success={false}>
          <StatusItem>
            <StatusIcon>{firebaseStatus.authInitialized ? '✅' : '❌'}</StatusIcon>
            <StatusText>
              Firebase Auth: {firebaseStatus.authInitialized ? 'Inicializado' : 'Não inicializado'}
            </StatusText>
          </StatusItem>
          <StatusItem>
            <StatusIcon>{firebaseStatus.firestoreInitialized ? '✅' : '❌'}</StatusIcon>
            <StatusText>
              Firestore: {firebaseStatus.firestoreInitialized ? 'Inicializado' : 'Não inicializado'}
            </StatusText>
          </StatusItem>
        </StatusCard>

        <Button onClick={() => navigate('/')}>
          Voltar para o App
        </Button>
      </Card>
    </Container>
  )
}

export default Setup
