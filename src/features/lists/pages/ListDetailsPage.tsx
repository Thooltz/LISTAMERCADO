import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useList } from '../hooks/useList'
import { useLists } from '../hooks/useLists'
import { useItems } from '../../items/hooks/useItems'
import { AddItemModal } from '../components/AddItemModal'
import { EditListModal } from '../components/EditListModal'
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
  z-index: 100;
  padding: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: ${props => (props.$variant === 'primary' ? 'var(--color-primary)' : 'var(--color-bg-secondary)')};
  color: ${props => (props.$variant === 'primary' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant === 'primary' ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

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
  transition: all 0.2s;
  opacity: ${props => (props.checked ? 0.6 : 1)};
  min-height: 60px;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
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

function ListDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { list, isLoading: listLoading, isNotFound } = useList(id)
  const { items, isLoading: itemsLoading, addItem, toggleCheck, deleteItem, isAdding } = useItems(id)
  const { renameList, deleteList, isRenaming, isDeleting } = useLists()

  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showEditListModal, setShowEditListModal] = useState(false)

  const handleAddItem = async (name: string, quantity?: number, unit?: string) => {
    if (!id) return
    await addItem({
      list_id: id,
      name,
      quantity,
      unit,
    })
  }

  const handleRenameList = async (title: string) => {
    if (!id) return
    await renameList({ id, title })
  }

  const handleDeleteList = async () => {
    if (!id) return
    await deleteList(id)
    navigate('/lists')
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

  // Loading state
  if (listLoading || itemsLoading) {
    return <LoadingSpinner />
  }

  // Not found state - apenas quando realmente não existe (não enquanto carrega)
  if (isNotFound || (!listLoading && !list && id)) {
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

  // Se não houver ID, não deve chegar aqui
  if (!id || !list) {
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
            <Title>{list.title}</Title>
          </HeaderContent>
        </StickyHeader>

        <ActionsBar>
          <Button $variant="primary" onClick={() => setShowAddItemModal(true)}>
            + Adicionar item
          </Button>
          <Button onClick={() => setShowEditListModal(true)}>
            Editar lista
          </Button>
        </ActionsBar>

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
                  {(item.quantity || item.unit) && (
                    <ItemDetails>
                      {item.quantity} {item.unit || 'un'}
                      {item.category && ` • ${item.category}`}
                    </ItemDetails>
                  )}
                </ItemContent>
                <ItemActions>
                  <IconButton onClick={() => handleDeleteItem(item.id)} title="Remover">
                    🗑️
                  </IconButton>
                </ItemActions>
              </ItemCard>
            ))
          )}
        </ItemsList>
      </Container>

      {/* Modais */}
      <AddItemModal
        show={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSave={handleAddItem}
        isSaving={isAdding}
      />

      <EditListModal
        show={showEditListModal}
        onClose={() => setShowEditListModal(false)}
        onSave={handleRenameList}
        onDelete={handleDeleteList}
        currentTitle={list.title}
        isSaving={isRenaming}
        isDeleting={isDeleting}
      />
    </>
  )
}

export default ListDetailsPage
