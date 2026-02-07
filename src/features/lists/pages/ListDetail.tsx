import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useList } from '../hooks/useList'
import { useLists } from '../hooks/useLists'
import { useItems } from '../../items/hooks/useItems'
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
`

const TitleSection = styled.div`
  flex: 1;
  min-width: 200px;
`

const TitleInput = styled.input`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  width: 100%;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-border);
  }

  &:focus {
    border-color: var(--color-primary);
    outline: none;
    background: var(--color-bg);
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${props => {
    if (props.$variant === 'primary') return 'var(--color-primary)'
    if (props.$variant === 'danger') return 'var(--color-danger)'
    return 'var(--color-bg-secondary)'
  }};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

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

const AddItemSection = styled.div`
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`

const AddItemForm = styled.form`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: flex-end;
`

const FormGroup = styled.div`
  flex: 1;
  min-width: 200px;
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

const QuantityInput = styled(Input)`
  width: 100px;
`

const ItemsList = styled.div`
  margin-bottom: var(--spacing-xl);
`

const ItemCard = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  transition: all 0.2s;
  opacity: ${props => (props.checked ? 0.6 : 1)};

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`

const ItemName = styled.span<{ checked: boolean }>`
  font-weight: 600;
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
`

const IconButton = styled.button`
  padding: var(--spacing-xs);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
  transition: color 0.2s;
  font-size: 1.2rem;

  &:hover {
    color: var(--color-danger);
  }
`

const EditInput = styled(Input)`
  font-size: 0.9rem;
  padding: var(--spacing-sm);
`

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-light);
`

const ErrorState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-danger);
`

function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { list, isLoading: listLoading, isNotFound } = useList(id)
  const { items, isLoading: itemsLoading, addItem, updateItem, toggleCheck, deleteItem, isAdding } = useItems(id)
  const { renameList, deleteList, isRenaming, isDeleting } = useLists()

  const [listTitle, setListTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('1')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemName, setEditingItemName] = useState('')
  const [editingItemQuantity, setEditingItemQuantity] = useState('')

  // Sincronizar título quando lista carregar
  useMemo(() => {
    if (list?.title && !isEditingTitle) {
      setListTitle(list.title)
    }
  }, [list?.title, isEditingTitle])

  const handleRenameList = async () => {
    if (!id || !listTitle.trim() || listTitle.trim() === list?.title) {
      setIsEditingTitle(false)
      return
    }

    try {
      await renameList({ id, title: listTitle.trim() })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Erro ao renomear lista:', error)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !itemName.trim()) return

    try {
      await addItem({
        list_id: id,
        name: itemName.trim(),
        quantity: parseInt(itemQuantity) || 1,
      })
      setItemName('')
      setItemQuantity('1')
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id)
    setEditingItemName(item.name)
    setEditingItemQuantity(item.quantity.toString())
  }

  const handleSaveEdit = async (itemId: string) => {
    if (!editingItemName.trim()) {
      setEditingItemId(null)
      return
    }

    try {
      await updateItem({
        id: itemId,
        input: {
          name: editingItemName.trim(),
          quantity: parseInt(editingItemQuantity) || 1,
        },
      })
      setEditingItemId(null)
      setEditingItemName('')
      setEditingItemQuantity('')
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
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

  const handleDeleteList = async () => {
    if (!id) return
    if (window.confirm('Tem certeza que deseja deletar esta lista? Todos os itens serão removidos.')) {
      try {
        await deleteList(id)
        navigate('/home')
      } catch (error) {
        console.error('Erro ao deletar lista:', error)
      }
    }
  }

  // Loading state
  if (listLoading || itemsLoading) {
    return <LoadingSpinner />
  }

  // Not found state - apenas quando realmente não existe
  if (isNotFound || (!listLoading && !list && id)) {
    return (
      <Container>
        <ErrorState>
          <h2>Lista não encontrada</h2>
          <p>A lista que você está procurando não existe ou foi removida.</p>
          <Button $variant="primary" onClick={() => navigate('/home')}>
            Voltar para listas
          </Button>
        </ErrorState>
      </Container>
    )
  }

  // Se não houver ID, não deve chegar aqui, mas por segurança
  if (!id) {
    return (
      <Container>
        <ErrorState>
          <h2>ID da lista não fornecido</h2>
          <Button $variant="primary" onClick={() => navigate('/home')}>
            Voltar para listas
          </Button>
        </ErrorState>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          {isEditingTitle ? (
            <TitleInput
              value={listTitle}
              onChange={e => setListTitle(e.target.value)}
              onBlur={handleRenameList}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleRenameList()
                } else if (e.key === 'Escape') {
                  setListTitle(list?.title || '')
                  setIsEditingTitle(false)
                }
              }}
              autoFocus
              disabled={isRenaming}
            />
          ) : (
            <TitleInput
              value={list?.title || ''}
              readOnly
              onDoubleClick={() => setIsEditingTitle(true)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </TitleSection>
        <Actions>
          <Button onClick={() => navigate('/home')}>← Voltar</Button>
          <Button $variant="danger" onClick={handleDeleteList} disabled={isDeleting}>
            {isDeleting ? 'Deletando...' : '🗑️ Deletar lista'}
          </Button>
        </Actions>
      </Header>

      <AddItemSection>
        <AddItemForm onSubmit={handleAddItem}>
          <FormGroup>
            <Label>Adicionar item</Label>
            <Input
              type="text"
              placeholder="Nome do item"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Quantidade</Label>
            <QuantityInput
              type="number"
              placeholder="1"
              value={itemQuantity}
              onChange={e => setItemQuantity(e.target.value)}
              min="1"
            />
          </FormGroup>
          <FormGroup>
            <Label>&nbsp;</Label>
            <Button $variant="primary" type="submit" disabled={isAdding || !itemName.trim()}>
              {isAdding ? 'Adicionando...' : '+ Adicionar'}
            </Button>
          </FormGroup>
        </AddItemForm>
      </AddItemSection>

      <ItemsList>
        {items.length === 0 ? (
          <EmptyState>
            <h3>Nenhum item ainda</h3>
            <p>Adicione itens à sua lista para começar!</p>
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
                {editingItemId === item.id ? (
                  <>
                    <EditInput
                      value={editingItemName}
                      onChange={e => setEditingItemName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(item.id)
                        } else if (e.key === 'Escape') {
                          setEditingItemId(null)
                        }
                      }}
                      autoFocus
                    />
                    <QuantityInput
                      type="number"
                      value={editingItemQuantity}
                      onChange={e => setEditingItemQuantity(e.target.value)}
                      min="1"
                      style={{ width: '80px' }}
                    />
                    <Button $variant="primary" onClick={() => handleSaveEdit(item.id)}>
                      Salvar
                    </Button>
                    <Button onClick={() => setEditingItemId(null)}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <ItemName checked={item.checked}>{item.name}</ItemName>
                    <ItemDetails>
                      {item.quantity} {item.unit || 'un'}
                    </ItemDetails>
                  </>
                )}
              </ItemContent>
              {editingItemId !== item.id && (
                <ItemActions>
                  <IconButton onClick={() => handleEditItem(item)} title="Editar">
                    ✏️
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(item.id)} title="Remover">
                    🗑️
                  </IconButton>
                </ItemActions>
              )}
            </ItemCard>
          ))
        )}
      </ItemsList>
    </Container>
  )
}

export default ListDetail
