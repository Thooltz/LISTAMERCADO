import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useList } from '../hooks/useList'
import { useLists } from '../hooks/useLists'
import { useItems } from '../../items/hooks/useItems'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

const Container = styled.div`
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
  max-width: 600px;
  margin: 0 auto;
`

const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  background: var(--color-bg);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
`

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  flex: 1;
  margin: 0;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  padding: var(--spacing-xs);
  line-height: 1;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ActionsBar = styled.div`
  display: flex;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: ${props => {
    if (props.$variant === 'primary') return 'var(--color-primary-gradient)'
    if (props.$variant === 'danger') return 'var(--color-danger)'
    return 'var(--color-bg-secondary)'
  }};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  box-shadow: ${props => props.$variant === 'primary' ? 'var(--shadow-md)' : 'none'};

  &:hover:not(:disabled) {
    opacity: ${props => props.$variant === 'primary' || props.$variant === 'danger' ? '0.9' : '1'};
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

const StatsBar = styled.div`
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin: 0 var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
  color: var(--color-text-light);
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-text);
`

const ItemsList = styled.div`
  padding: 0 var(--spacing-md);
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
    color: var(--color-primary);
  }

  &.danger:hover {
    color: var(--color-danger);
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-light);
`

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`

const EmptyText = styled.p`
  margin-bottom: var(--spacing-lg);
`

const ErrorState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-danger);
`

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
`

// Modal
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

  @media (min-width: 768px) {
    max-width: 500px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: var(--radius-xl);
  }
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

const Select = styled.select`
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

function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { list, isLoading: listLoading, isNotFound } = useList(listId)
  const { items, isLoading: itemsLoading, addItem, updateItem, toggleCheck, deleteItem, isAdding, totalItems, checkedItems, uncheckedItems } = useItems(listId)
  const { renameList, deleteList, isRenaming, isDeleting } = useLists()

  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showEditItemModal, setShowEditItemModal] = useState(false)
  const [showEditListModal, setShowEditListModal] = useState(false)
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false)
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false)
  
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('')
  const [itemUnit, setItemUnit] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [listName, setListName] = useState('')

  const handleAddItem = async () => {
    if (!itemName.trim() || !listId) {
      return
    }

    try {
      await addItem({
        name: itemName.trim(),
        qty: itemQty ? parseInt(itemQty) : undefined,
        unit: itemUnit || undefined,
        category: itemCategory || undefined,
      })
      setItemName('')
      setItemQty('')
      setItemUnit('')
      setItemCategory('')
      setShowAddItemModal(false)
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemQty(item.qty?.toString() || '')
    setItemUnit(item.unit || '')
    setItemCategory(item.category || '')
    setShowEditItemModal(true)
  }

  const handleSaveEditItem = async () => {
    if (!editingItemId || !itemName.trim() || !listId) {
      return
    }

    try {
      await updateItem({
        id: editingItemId,
        updates: {
          name: itemName.trim(),
          qty: itemQty ? parseInt(itemQty) : undefined,
          unit: itemUnit || undefined,
          category: itemCategory || undefined,
        },
      })
      setShowEditItemModal(false)
      setEditingItemId(null)
      setItemName('')
      setItemQty('')
      setItemUnit('')
      setItemCategory('')
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItemId || !listId) {
      return
    }

    try {
      await deleteItem(deletingItemId)
      setShowDeleteItemConfirm(false)
      setDeletingItemId(null)
    } catch (error) {
      console.error('Erro ao remover item:', error)
    }
  }

  const handleEditList = () => {
    if (list) {
      setListName(list.name)
      setShowEditListModal(true)
    }
  }

  const handleSaveEditList = async () => {
    if (!listId || !listName.trim()) {
      return
    }

    try {
      await renameList({ id: listId, name: listName.trim() })
      setShowEditListModal(false)
      setListName('')
    } catch (error) {
      console.error('Erro ao renomear lista:', error)
    }
  }

  const handleDeleteList = async () => {
    if (!listId) {
      return
    }

    try {
      await deleteList(listId)
      navigate('/lists')
    } catch (error) {
      console.error('Erro ao deletar lista:', error)
    }
  }

  if (listLoading || itemsLoading) {
    return <LoadingSpinner />
  }

  if (isNotFound || (!listLoading && !list && listId)) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Lista não encontrada</ErrorTitle>
          <p>A lista que você está procurando não existe ou foi removida.</p>
          <Button $variant="primary" onClick={() => navigate('/lists')}>
            Voltar para listas
          </Button>
        </ErrorState>
      </Container>
    )
  }

  if (!listId || !list) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>ID da lista não fornecido</ErrorTitle>
          <Button $variant="primary" onClick={() => navigate('/lists')}>
            Voltar para listas
          </Button>
        </ErrorState>
      </Container>
    )
  }

  return (
    <>
      <Container>
        <StickyHeader>
          <HeaderContent>
            <BackButton onClick={() => navigate('/lists')}>←</BackButton>
            <Title>{list.name}</Title>
          </HeaderContent>
        </StickyHeader>

        <ActionsBar>
          <Button $variant="primary" onClick={() => setShowAddItemModal(true)}>
            + Adicionar Item
          </Button>
          <Button onClick={handleEditList}>
            ✏️ Renomear
          </Button>
          <Button $variant="danger" onClick={() => setShowDeleteListConfirm(true)}>
            🗑️ Deletar
          </Button>
        </ActionsBar>

        {(totalItems > 0) && (
          <StatsBar>
            <StatItem>
              <StatValue>{totalItems}</StatValue>
              <div>Total</div>
            </StatItem>
            <StatItem>
              <StatValue>{uncheckedItems}</StatValue>
              <div>Pendentes</div>
            </StatItem>
            <StatItem>
              <StatValue>{checkedItems}</StatValue>
              <div>Concluídos</div>
            </StatItem>
          </StatsBar>
        )}

        <ItemsList>
          {items.length === 0 ? (
            <EmptyState>
              <EmptyTitle>Nenhum item ainda</EmptyTitle>
              <EmptyText>Adicione itens à sua lista para começar!</EmptyText>
            </EmptyState>
          ) : (
            items.map(item => (
              <ItemCard key={item.id} checked={item.checked}>
                <Checkbox
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck({ id: item.id, checked: !item.checked })}
                />
                <ItemContent>
                  <ItemName checked={item.checked}>{item.name}</ItemName>
                  <ItemDetails>
                    {item.qty && `${item.qty} `}
                    {item.unit && `${item.unit} `}
                    {item.category && `• ${item.category}`}
                  </ItemDetails>
                </ItemContent>
                <ItemActions>
                  <IconButton onClick={() => handleEditItem(item)} title="Editar">
                    ✏️
                  </IconButton>
                  <IconButton
                    className="danger"
                    onClick={() => {
                      setDeletingItemId(item.id)
                      setShowDeleteItemConfirm(true)
                    }}
                    title="Remover"
                  >
                    🗑️
                  </IconButton>
                </ItemActions>
              </ItemCard>
            ))
          )}
        </ItemsList>
      </Container>

      {/* Modal Adicionar Item */}
      <Overlay $show={showAddItemModal} onClick={() => setShowAddItemModal(false)} />
      <BottomSheet $show={showAddItemModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Adicionar Item</ModalTitle>
          <CloseButton onClick={() => {
            setShowAddItemModal(false)
            setItemName('')
            setItemQty('')
            setItemUnit('')
            setItemCategory('')
          }}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome do item *</Label>
          <Input
            type="text"
            placeholder="Ex: Shampoo"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem()
              }
            }}
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <Label>Quantidade (opcional)</Label>
          <Input
            type="number"
            min="1"
            placeholder="1"
            value={itemQty}
            onChange={e => setItemQty(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Unidade (opcional)</Label>
          <Select value={itemUnit} onChange={e => setItemUnit(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="un">un (unidade)</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l (litro)</option>
            <option value="ml">ml</option>
            <option value="pct">pct (pacote)</option>
            <option value="cx">cx (caixa)</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Categoria (opcional)</Label>
          <Input
            type="text"
            placeholder="Ex: cabelo, limpeza, comida"
            value={itemCategory}
            onChange={e => setItemCategory(e.target.value)}
          />
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowAddItemModal(false)
            setItemName('')
            setItemQty('')
            setItemUnit('')
            setItemCategory('')
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

      {/* Modal Editar Item */}
      <Overlay $show={showEditItemModal} onClick={() => setShowEditItemModal(false)} />
      <BottomSheet $show={showEditItemModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Item</ModalTitle>
          <CloseButton onClick={() => {
            setShowEditItemModal(false)
            setEditingItemId(null)
            setItemName('')
            setItemQty('')
            setItemUnit('')
            setItemCategory('')
          }}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome do item *</Label>
          <Input
            type="text"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <Label>Quantidade (opcional)</Label>
          <Input
            type="number"
            min="1"
            value={itemQty}
            onChange={e => setItemQty(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Unidade (opcional)</Label>
          <Select value={itemUnit} onChange={e => setItemUnit(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="un">un (unidade)</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l (litro)</option>
            <option value="ml">ml</option>
            <option value="pct">pct (pacote)</option>
            <option value="cx">cx (caixa)</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Categoria (opcional)</Label>
          <Input
            type="text"
            value={itemCategory}
            onChange={e => setItemCategory(e.target.value)}
          />
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowEditItemModal(false)
            setEditingItemId(null)
            setItemName('')
            setItemQty('')
            setItemUnit('')
            setItemCategory('')
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSaveEditItem} 
            disabled={!itemName.trim()}
          >
            Salvar
          </Button>
        </ModalActions>
      </BottomSheet>

      {/* Modal Editar Lista */}
      <Overlay $show={showEditListModal} onClick={() => setShowEditListModal(false)} />
      <BottomSheet $show={showEditListModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Renomear Lista</ModalTitle>
          <CloseButton onClick={() => {
            setShowEditListModal(false)
            setListName('')
          }}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome da lista</Label>
          <Input
            type="text"
            value={listName}
            onChange={e => setListName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSaveEditList()
              }
            }}
            autoFocus
          />
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowEditListModal(false)
            setListName('')
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSaveEditList} 
            disabled={isRenaming || !listName.trim()}
          >
            {isRenaming ? 'Salvando...' : 'Salvar'}
          </Button>
        </ModalActions>
      </BottomSheet>

      {/* Modal Confirmar Deletar Lista */}
      <Overlay $show={showDeleteListConfirm} onClick={() => setShowDeleteListConfirm(false)} />
      <BottomSheet $show={showDeleteListConfirm} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <CloseButton onClick={() => setShowDeleteListConfirm(false)}>✕</CloseButton>
        </ModalHeader>
        
        <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text)' }}>
          Tem certeza que deseja deletar esta lista? Todos os {totalItems} {totalItems === 1 ? 'item' : 'itens'} serão removidos permanentemente.
        </p>

        <ModalActions>
          <Button onClick={() => setShowDeleteListConfirm(false)}>
            Cancelar
          </Button>
          <Button 
            $variant="danger" 
            onClick={handleDeleteList} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deletando...' : 'Deletar Lista'}
          </Button>
        </ModalActions>
      </BottomSheet>

      {/* Modal Confirmar Deletar Item */}
      <Overlay $show={showDeleteItemConfirm} onClick={() => setShowDeleteItemConfirm(false)} />
      <BottomSheet $show={showDeleteItemConfirm} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <CloseButton onClick={() => {
            setShowDeleteItemConfirm(false)
            setDeletingItemId(null)
          }}>✕</CloseButton>
        </ModalHeader>
        
        <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text)' }}>
          Tem certeza que deseja remover este item?
        </p>

        <ModalActions>
          <Button onClick={() => {
            setShowDeleteItemConfirm(false)
            setDeletingItemId(null)
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="danger" 
            onClick={handleDeleteItem}
          >
            Deletar
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}

export default ListDetailPage
