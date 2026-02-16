import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useList } from '../hooks/useList'
import { useItems } from '../../items/hooks/useItems'
import { useLists } from '../hooks/useLists'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import toast from 'react-hot-toast'

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
`

const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`

const HeaderContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackButton = styled.button`
  background: #f5f5f5;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #1a1a1a;
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s;

  &:active {
    background: #e0e0e0;
    transform: scale(0.95);
  }
`

const Title = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
  margin: 0;
  line-height: 1.4;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`

const IconButton = styled.button`
  background: #f5f5f5;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #666;
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s;

  &:active {
    background: #e0e0e0;
    transform: scale(0.95);
  }

  &.danger:active {
    color: #e74c3c;
    background: #fee;
  }
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
`

const AddButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.2s;
  margin-bottom: 16px;
  min-height: 52px;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const StatsBar = styled.div`
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-weight: 700;
  font-size: 1.3rem;
  color: #1a1a1a;
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #999;
`

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ItemCard = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
  opacity: ${props => (props.checked ? 0.6 : 1)};
  min-height: 64px;

  &:active {
    transform: scale(0.98);
  }
`

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #667eea;
`

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const ItemName = styled.span<{ checked: boolean }>`
  font-weight: 600;
  font-size: 1rem;
  text-decoration: ${props => (props.checked ? 'line-through' : 'none')};
  color: ${props => (props.checked ? '#999' : '#1a1a1a')};
  flex: 1;
  min-width: 0;
  word-break: break-word;
`

const ItemQty = styled.span`
  font-size: 0.9rem;
  color: #999;
  white-space: nowrap;
`

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const ActionButton = styled.button`
  background: #f5f5f5;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #666;
  padding: 8px;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:active {
    background: #e0e0e0;
    transform: scale(0.95);
  }

  &.danger:active {
    color: #e74c3c;
    background: #fee;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`

const EmptyTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #666;
  font-weight: 600;
`

const EmptyText = styled.p`
  margin-bottom: 24px;
  font-size: 0.95rem;
`

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #e74c3c;
`

const ErrorTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 12px;
  font-weight: 600;
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
  backdrop-filter: blur(4px);
`

const BottomSheet = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  max-height: 85vh;
  overflow-y: auto;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);

  @media (min-width: 768px) {
    max-width: 500px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: 24px;
  }
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
`

const CloseButton = styled.button`
  background: #f5f5f5;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:active {
    background: #e0e0e0;
    transform: scale(0.95);
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
`

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  background: #fafafa;
  color: #1a1a1a;
  min-height: 48px;
  transition: all 0.2s;

  &:focus {
    border-color: #667eea;
    outline: none;
    background: white;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 14px;
  background: ${props => {
    if (props.$variant === 'primary') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    if (props.$variant === 'danger') return '#e74c3c'
    return '#f5f5f5'
  }};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : '#1a1a1a')};
  border: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'none' : '2px solid #e0e0e0')};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  const [itemQty, setItemQty] = useState('1')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [listName, setListName] = useState('')

  // Redirecionar se não tiver listId
  if (!listId) {
    toast.error('Selecione uma lista')
    navigate('/lists')
    return null
  }

  const handleAddItem = async () => {
    if (!itemName.trim() || !listId) {
      toast.error('Nome do item é obrigatório')
      return
    }

    try {
      await addItem({
        name: itemName.trim(),
        qty: itemQty ? parseInt(itemQty) : undefined,
      })
      setItemName('')
      setItemQty('1')
      setShowAddItemModal(false)
      toast.success('Item adicionado!')
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error)
      toast.error(error.message || 'Erro ao adicionar item')
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemQty(item.qty?.toString() || '1')
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
        },
      })
      setShowEditItemModal(false)
      setEditingItemId(null)
      setItemName('')
      setItemQty('1')
      toast.success('Item atualizado!')
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error)
      toast.error(error.message || 'Erro ao atualizar item')
    }
  }

  const handleDeleteItem = async () => {
    if (!editingItemId || !listId) {
      return
    }

    try {
      await deleteItem(editingItemId)
      setShowDeleteItemConfirm(false)
      setEditingItemId(null)
      toast.success('Item removido!')
    } catch (error: any) {
      console.error('Erro ao remover item:', error)
      toast.error(error.message || 'Erro ao remover item')
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
      toast.success('Lista renomeada!')
    } catch (error: any) {
      console.error('Erro ao renomear lista:', error)
      toast.error(error.message || 'Erro ao renomear lista')
    }
  }

  const handleDeleteList = async () => {
    if (!listId) {
      return
    }

    try {
      await deleteList(listId)
      toast.success('Lista deletada!')
      navigate('/lists')
    } catch (error: any) {
      console.error('Erro ao deletar lista:', error)
      toast.error(error.message || 'Erro ao deletar lista')
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
          <Button $variant="primary" onClick={() => navigate('/lists')} style={{ marginTop: '20px' }}>
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
          <Button $variant="primary" onClick={() => navigate('/lists')} style={{ marginTop: '20px' }}>
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
            <HeaderActions>
              <IconButton onClick={handleEditList} title="Renomear">
                ✏️
              </IconButton>
              <IconButton
                className="danger"
                onClick={() => setShowDeleteListConfirm(true)}
                title="Deletar"
              >
                🗑️
              </IconButton>
            </HeaderActions>
          </HeaderContent>
        </StickyHeader>

        <Content>
          <AddButton onClick={() => setShowAddItemModal(true)} disabled={isAdding}>
            {isAdding ? 'Adicionando...' : '+ Adicionar Item'}
          </AddButton>

          {(totalItems > 0) && (
            <StatsBar>
              <StatItem>
                <StatValue>{totalItems}</StatValue>
                <StatLabel>Total</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{uncheckedItems}</StatValue>
                <StatLabel>Pendentes</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{checkedItems}</StatValue>
                <StatLabel>Concluídos</StatLabel>
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
                    {item.qty > 1 && <ItemQty>({item.qty})</ItemQty>}
                  </ItemContent>
                  <ItemActions>
                    <ActionButton onClick={() => handleEditItem(item)} title="Editar">
                      ✏️
                    </ActionButton>
                    <ActionButton
                      className="danger"
                      onClick={() => {
                        setEditingItemId(item.id)
                        setShowDeleteItemConfirm(true)
                      }}
                      title="Remover"
                    >
                      🗑️
                    </ActionButton>
                  </ItemActions>
                </ItemCard>
              ))
            )}
          </ItemsList>
        </Content>
      </Container>

      {/* Modal Adicionar Item */}
      <Overlay $show={showAddItemModal} onClick={() => setShowAddItemModal(false)} />
      <BottomSheet $show={showAddItemModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Adicionar Item</ModalTitle>
          <CloseButton onClick={() => {
            setShowAddItemModal(false)
            setItemName('')
            setItemQty('1')
          }}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome do item *</Label>
          <Input
            type="text"
            placeholder="Ex: Arroz"
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

      {/* Modal Editar Item */}
      <Overlay $show={showEditItemModal} onClick={() => setShowEditItemModal(false)} />
      <BottomSheet $show={showEditItemModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Item</ModalTitle>
          <CloseButton onClick={() => {
            setShowEditItemModal(false)
            setEditingItemId(null)
            setItemName('')
            setItemQty('1')
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

        <ModalActions>
          <Button onClick={() => {
            setShowEditItemModal(false)
            setEditingItemId(null)
            setItemName('')
            setItemQty('1')
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
        
        <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
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
            setEditingItemId(null)
          }}>✕</CloseButton>
        </ModalHeader>
        
        <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
          Tem certeza que deseja remover este item?
        </p>

        <ModalActions>
          <Button onClick={() => {
            setShowDeleteItemConfirm(false)
            setEditingItemId(null)
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
