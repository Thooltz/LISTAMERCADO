import { useState } from 'react'
import { useAuth } from '../../auth/context/AuthProvider'
import { useItems } from '../../items/hooks/useItems'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import toast from 'react-hot-toast'

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

const UserInfo = styled.div`
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: var(--spacing-md) var(--spacing-lg);
  background: ${props => 
    props.$variant === 'primary' 
      ? 'var(--color-primary-gradient)' 
      : 'var(--color-bg-secondary)'};
  color: ${props => (props.$variant === 'primary' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant === 'primary' ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  box-shadow: ${props => props.$variant === 'primary' ? 'var(--shadow-md)' : 'none'};

  &:hover:not(:disabled) {
    opacity: ${props => props.$variant === 'primary' ? '0.95' : '1'};
    transform: translateY(-2px);
    box-shadow: ${props => props.$variant === 'primary' ? 'var(--shadow-colored)' : 'var(--shadow-sm)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ItemsList = styled.div`
  margin-bottom: var(--spacing-lg);
`

const ItemCard = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => (props.checked ? 0.6 : 1)};
  min-height: 60px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--color-primary-gradient);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateX(4px);
    
    &::before {
      transform: scaleY(1);
    }
  }
`

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
`

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`

const ItemName = styled.span<{ checked: boolean }>`
  font-weight: 600;
  font-size: 1rem;
  text-decoration: ${props => (props.checked ? 'line-through' : 'none')};
  color: var(--color-text);
`

const ItemDetails = styled.span`
  color: var(--color-text-light);
  font-size: 0.9rem;
`

const ItemActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
`

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-light);
  padding: var(--spacing-xs);
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: var(--color-danger);
  }
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
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--spacing-xl);
  max-height: 85vh;
  overflow-y: auto;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    max-width: 500px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: var(--radius-xl);
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
  min-height: 48px;

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
  const { user, signOut } = useAuth()
  const { items, isLoading, addItem, toggleCheck, deleteItem, isAdding } = useItems()
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('1')

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      return
    }

    const qty = parseInt(itemQty) || 1
    if (qty < 1) {
      toast.error('Quantidade deve ser maior que zero')
      return
    }

    try {
      await addItem({ name: itemName.trim(), qty })
      setItemName('')
      setItemQty('1')
      setShowAddItemModal(false)
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      try {
        await deleteItem(itemId)
      } catch (error) {
        console.error('Erro ao remover item:', error)
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Container>
        <Header>
          <Title>Lista do Mercado</Title>
          <Button $variant="primary" onClick={() => setShowAddItemModal(true)}>
            + Adicionar
          </Button>
        </Header>

        {user && (
          <UserInfo>
            Logado como: <strong>{user.email}</strong>
            <Button 
              onClick={handleLogout}
              style={{ marginLeft: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)' }}
            >
              Sair
            </Button>
          </UserInfo>
        )}

        {items.length === 0 ? (
          <EmptyState>
            <EmptyTitle>Nenhum item ainda</EmptyTitle>
            <EmptyText>Adicione itens à sua lista de mercado para começar!</EmptyText>
            <Button $variant="primary" onClick={() => setShowAddItemModal(true)}>
              Adicionar primeiro item
            </Button>
          </EmptyState>
        ) : (
          <ItemsList>
            {items.map(item => (
              <ItemCard key={item.id} checked={item.checked}>
                <Checkbox
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck({ id: item.id, checked: !item.checked })}
                />
                <ItemContent>
                  <ItemName checked={item.checked}>{item.name}</ItemName>
                  <ItemDetails>
                    Quantidade: {item.qty}
                  </ItemDetails>
                </ItemContent>
                <ItemActions>
                  <IconButton onClick={() => handleDeleteItem(item.id)} title="Remover">
                    🗑️
                  </IconButton>
                </ItemActions>
              </ItemCard>
            ))}
          </ItemsList>
        )}
      </Container>

      {/* Modal Adicionar Item */}
      <Overlay $show={showAddItemModal} onClick={() => setShowAddItemModal(false)} />
      <BottomSheet $show={showAddItemModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Adicionar Item</ModalTitle>
          <CloseButton onClick={() => setShowAddItemModal(false)}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome do item</Label>
          <Input
            type="text"
            placeholder="Ex: Arroz"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem()
              } else if (e.key === 'Escape') {
                setShowAddItemModal(false)
              }
            }}
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <Label>Quantidade</Label>
          <Input
            type="number"
            min="1"
            placeholder="1"
            value={itemQty}
            onChange={e => setItemQty(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem()
              }
            }}
          />
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowAddItemModal(false)
            setItemName('')
            setItemQty('1')
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleAddItem} 
            disabled={isAdding || !itemName.trim()}
          >
            {isAdding ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}

export default ListsPage
