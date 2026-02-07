import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthProvider'
import { useLists } from '../hooks/useLists'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

const Container = styled.div`
  min-height: 100vh;
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${props => (props.$variant === 'primary' ? 'var(--color-primary)' : 'var(--color-bg-secondary)')};
  color: ${props => (props.$variant === 'primary' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant === 'primary' ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => (props.$variant === 'primary' ? 'var(--color-primary-dark)' : 'var(--color-bg-tertiary)')};
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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-light);
  font-size: 0.9rem;
`

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ListCard = styled.div`
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`

const ListTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
`

const ListMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-top: var(--spacing-md);
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

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => (props.$show ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
`

const ModalContent = styled.div`
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
`

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
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

  &:focus {
    border-color: var(--color-primary);
    outline: none;
  }
`

const ItemsSection = styled.div`
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
`

const ItemsList = styled.div`
  margin-bottom: var(--spacing-md);
  max-height: 200px;
  overflow-y: auto;
`

const ItemRow = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  align-items: center;
`

const ItemInput = styled(Input)`
  flex: 1;
`

const QuantityInput = styled(Input)`
  width: 80px;
`

const RemoveButton = styled.button`
  padding: var(--spacing-sm);
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    opacity: 0.9;
  }
`

const AddItemButton = styled(Button)`
  width: 100%;
  margin-top: var(--spacing-sm);
`

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
`

interface ItemInput {
  name: string
  quantity: string
}

function Home() {
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
  const [items, setItems] = useState<ItemInput[]>([])

  const handleCreateList = async () => {
    if (!listTitle.trim()) {
      return
    }

    try {
      // Criar lista apenas com título
      const newList = await createList(listTitle.trim())

      // Limpar formulário
      setListTitle('')
      setItems([])
      setShowCreateModal(false)

      // Redirecionar para a lista criada
      if (newList?.id) {
        navigate(`/lists/${newList.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error)
    }
  }

  const addItemRow = () => {
    setItems([...items, { name: '', quantity: '1' }])
  }

  const updateItem = (index: number, field: 'name' | 'quantity', value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Container>
      <Header>
        <Title>Minhas Listas</Title>
        <Actions>
          <UserInfo>
            <span>{user?.email}</span>
          </UserInfo>
          <Button onClick={() => navigate('/settings')}>Configurações</Button>
          <Button $variant="primary" onClick={() => setShowCreateModal(true)}>
            + Nova Lista
          </Button>
        </Actions>
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
                <span>
                  {new Date(list.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </ListMeta>
            </ListCard>
          ))}
        </ListsGrid>
      )}

      <Modal $show={showCreateModal} onClick={() => setShowCreateModal(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalTitle>Nova Lista</ModalTitle>
          
          <FormGroup>
            <Label>Nome da lista</Label>
            <Input
              type="text"
              placeholder="Ex: Mercado do mês"
              value={listTitle}
              onChange={e => setListTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (items.length === 0) {
                    addItemRow()
                  }
                } else if (e.key === 'Escape') {
                  setShowCreateModal(false)
                }
              }}
              autoFocus
            />
          </FormGroup>

          <ItemsSection>
            <Label>Itens da lista (opcional)</Label>
            <ItemsList>
              {items.map((item, index) => (
                <ItemRow key={index}>
                  <ItemInput
                    type="text"
                    placeholder="Nome do item"
                    value={item.name}
                    onChange={e => updateItem(index, 'name', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (index === items.length - 1) {
                          addItemRow()
                        }
                      }
                    }}
                  />
                  <QuantityInput
                    type="number"
                    placeholder="Qtd"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                    min="1"
                  />
                  <RemoveButton onClick={() => removeItem(index)}>
                    ✕
                  </RemoveButton>
                </ItemRow>
              ))}
            </ItemsList>
            <AddItemButton $variant="secondary" onClick={addItemRow}>
              + Adicionar item
            </AddItemButton>
          </ItemsSection>

          <ModalActions>
            <Button onClick={() => {
              setShowCreateModal(false)
              setListTitle('')
              setItems([])
            }}>
              Cancelar
            </Button>
            <Button 
              $variant="primary" 
              onClick={handleCreateList} 
              disabled={isCreating || !listTitle.trim()}
            >
              {isCreating ? 'Criando...' : 'Criar lista'}
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default Home
