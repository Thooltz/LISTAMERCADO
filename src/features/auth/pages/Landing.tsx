import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  text-align: center;
`

const Content = styled.div`
  max-width: 600px;
  width: 100%;
`

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: var(--spacing-2xl);
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: var(--spacing-xl);
  }
`

const Features = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }
`

const Feature = styled.li`
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
`

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
`

const FeatureText = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`

const Button = styled(Link)`
  display: inline-block;
  padding: var(--spacing-md) var(--spacing-xl);
  background: white;
  color: var(--color-primary);
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow-lg);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }
`

function Landing() {
  return (
    <Container>
      <Content>
        <Title>SmartList</Title>
        <Subtitle>
          Sua lista de compras inteligente. Organize, sincronize e nunca mais esqueça um item.
        </Subtitle>
        <Features>
          <Feature>
            <FeatureTitle>📱 Multi-dispositivo</FeatureTitle>
            <FeatureText>Acesse de qualquer lugar, seus dados sempre sincronizados</FeatureText>
          </Feature>
          <Feature>
            <FeatureTitle>⚡ Rápido</FeatureTitle>
            <FeatureText>Adicione itens com um clique, interface otimizada para velocidade</FeatureText>
          </Feature>
          <Feature>
            <FeatureTitle>🧠 Inteligente</FeatureTitle>
            <FeatureText>Sugestões automáticas e categorização inteligente</FeatureText>
          </Feature>
          <Feature>
            <FeatureTitle>💾 Offline</FeatureTitle>
            <FeatureText>Funciona mesmo sem internet, sincroniza quando voltar</FeatureText>
          </Feature>
        </Features>
        <Button to="/auth">Começar agora</Button>
      </Content>
    </Container>
  )
}

export default Landing
