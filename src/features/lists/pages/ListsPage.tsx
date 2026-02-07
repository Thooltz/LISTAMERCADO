import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthProvider'
import { useLists } from '../hooks/useLists'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

const Container = styled.div`
  min-height: 100vh;
  padding: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md) 0;
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: var(--spacing-md) var(--spacing-lg);
  background: ${props => (props.$variant === 'primary' ? 'var(--color-primary)' : 'var(--color-bg-secondary)')};
  color: ${props => (props.$variant === 'primary' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant === 'primary' ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px; /* Área de toque confortável */

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
`

const ListCard = styled.div`
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const ListTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`

const ListMeta = styled.div`
  font-size: 0.85rem;
  color: var(--color-text-light);
`

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-light);
`

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`

const EmptyText = styled.p`
  margin-bottom: var(--spacing-lg);
`

// Bottom Sheet Modal (Mobile-first)
const BottomSheet = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-xl);
  max-height: 85vh;
  overflow-y: auto;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease-out;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);

  @media (min-width: 768px) {
    max-width: 500px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: var(--radius-lg);
    max-height: 80vh;
  }
`

const Overlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => (props.$show ? 'block' : 'none')};
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-light);
  padding: var(--spacing-xs);
  line-height: 1;
`

const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
`

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 48px; /* Área de toque confortável */

  &:focus {
    border-color: var(--color-primary);
    outline: none;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`

function ListsPage() {
  const { user } = useAuth()
  const { 
    lists, 
    isLoading, 
    createList, 
    isCreating
  } = useLists()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [listTitle, setListTitle] = useState('')

  const handleCreateList = async () => {
    if (!listTitle.trim()) {
      return
    }

    try {
      const newList = await createList(listTitle.trim())
      setListTitle('')
      setShowCreateModal(false)

      // Redirecionar para a lista criada
      if (newList?.id) {
        navigate(`/lists/${newList.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Container>
        <Header>
          <Title>Minhas Listas</Title>
          <Button $variant="primary" onClick={() => setShowCreateModal(true)}>
            + Criar
          </Button>
        </Header>

        {lists.length === 0 ? (
          <EmptyState>
            <EmptyTitle>Nenhuma lista ainda</EmptyTitle>
            <EmptyText>Crie sua primeira lista de compras para começar!</EmptyText>
            <Button $variant="primary" onClick={() => setShowCreateModal(true)}>
              Criar primeira lista
            </Button>
          </EmptyState>
        ) : (
          <ListsGrid>
            {lists.map(list => (
              <ListCard key={list.id} onClick={() => navigate(`/lists/${list.id}`)}>
                <ListTitle>{list.title}</ListTitle>
                <ListMeta>
                  {new Date(list.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </ListMeta>
              </ListCard>
            ))}
          </ListsGrid>
        )}
      </Container>

      {/* Modal Criar Lista */}
      <Overlay $show={showCreateModal} onClick={() => setShowCreateModal(false)} />
      <BottomSheet $show={showCreateModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Nova Lista</ModalTitle>
          <CloseButton onClick={() => setShowCreateModal(false)}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome da lista</Label>
          <Input
            type="text"
            placeholder="Ex: Mercado do mês"
            value={listTitle}
            onChange={e => setListTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreateList()
              } else if (e.key === 'Escape') {
                setShowCreateModal(false)
              }
            }}
            autoFocus
          />
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowCreateModal(false)
            setListTitle('')
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleCreateList} 
            disabled={isCreating || !listTitle.trim()}
          >
            {isCreating ? 'Criando...' : 'Criar'}
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}

export default ListsPage
