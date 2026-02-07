import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;

  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
  }
`

function LoadingSpinner() {
  return <Spinner />
}

export default LoadingSpinner
