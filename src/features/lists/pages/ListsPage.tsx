import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthProvider'
import { useLists } from '../hooks/useLists'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

const Container = styled.div`
  min-height: 100vh;
  padding: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md) 0;
  flex-wrap: wrap;
  gap: var(--spacing-md);
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--color-text-light);
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
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

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--color-primary-gradient);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-colored);
    transform: translateY(-4px);
    
    &::before {
      transform: scaleX(1);
    }
  }

  &:active {
    transform: translateY(-2px);
  }
`

const ListTitle = styled.h3`
  font-size: 1.1rem;
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

const ListActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
`

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-text-light);
  padding: var(--spacing-xs);
  transition: color 0.2s;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);

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

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`

const EmptyText = styled.p`
  margin-bottom: var(--spacing-lg);
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

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`

function ListsPage() {
  const { user } = useAuth()
  const { lists, isLoading, createList, renameList, deleteList, isCreating, isDeleting } = useLists()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [listName, setListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [deletingListId, setDeletingListId] = useState<string | null>(null)

  const handleCreateList = async () => {
    if (!listName.trim()) {
      return
    }

    try {
      await createList(listName.trim())
      setListName('')
      setShowCreateModal(false)
    } catch (error) {
      console.error('Erro ao criar lista:', error)
    }
  }

  const handleEditList = (listId: string, currentName: string) => {
    setEditingListId(listId)
    setListName(currentName)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingListId || !listName.trim()) {
      return
    }

    try {
      await renameList({ id: editingListId, name: listName.trim() })
      setShowEditModal(false)
      setEditingListId(null)
      setListName('')
    } catch (error) {
      console.error('Erro ao renomear lista:', error)
    }
  }

  const handleDeleteList = async () => {
    if (!deletingListId) {
      return
    }

    try {
      await deleteList(deletingListId)
      setShowDeleteConfirm(false)
      setDeletingListId(null)
    } catch (error) {
      console.error('Erro ao deletar lista:', error)
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
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <UserInfo>
              {user?.email}
            </UserInfo>
            <Button onClick={() => navigate('/settings')}>
              Configurações
            </Button>
            <Button $variant="primary" onClick={() => setShowCreateModal(true)}>
              + Nova Lista
            </Button>
          </div>
        </Header>

        {lists.length === 0 ? (
          <EmptyState>
            <EmptyTitle>Nenhuma lista ainda</EmptyTitle>
            <EmptyText>Crie sua primeira lista para começar!</EmptyText>
            <Button $variant="primary" onClick={() => setShowCreateModal(true)}>
              Criar primeira lista
            </Button>
          </EmptyState>
        ) : (
          <ListsGrid>
            {lists.map(list => (
              <ListCard key={list.id} onClick={() => navigate(`/lists/${list.id}`)}>
                <ListTitle>{list.name}</ListTitle>
                <ListMeta>
                  <span>
                    {new Date(list.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                  {list.itemCount !== undefined && (
                    <span>{list.itemCount} {list.itemCount === 1 ? 'item' : 'itens'}</span>
                  )}
                </ListMeta>
                <ListActions onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={() => handleEditList(list.id, list.name)}
                    title="Editar"
                  >
                    ✏️ Editar
                  </IconButton>
                  <IconButton
                    className="danger"
                    onClick={() => {
                      setDeletingListId(list.id)
                      setShowDeleteConfirm(true)
                    }}
                    title="Deletar"
                  >
                    🗑️ Deletar
                  </IconButton>
                </ListActions>
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
            placeholder="Ex: Compra da Semana"
            value={listName}
            onChange={e => setListName(e.target.value)}
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
            setListName('')
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleCreateList} 
            disabled={isCreating || !listName.trim()}
          >
            {isCreating ? 'Criando...' : 'Criar'}
          </Button>
        </ModalActions>
      </BottomSheet>

      {/* Modal Editar Lista */}
      <Overlay $show={showEditModal} onClick={() => setShowEditModal(false)} />
      <BottomSheet $show={showEditModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Lista</ModalTitle>
          <CloseButton onClick={() => {
            setShowEditModal(false)
            setEditingListId(null)
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
                handleSaveEdit()
              } else if (e.key === 'Escape') {
                setShowEditModal(false)
              }
            }}
            autoFocus
          />
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowEditModal(false)
            setEditingListId(null)
            setListName('')
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSaveEdit} 
            disabled={!listName.trim()}
          >
            Salvar
          </Button>
        </ModalActions>
      </BottomSheet>

      {/* Modal Confirmar Deletar */}
      <Overlay $show={showDeleteConfirm} onClick={() => setShowDeleteConfirm(false)} />
      <BottomSheet $show={showDeleteConfirm} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <CloseButton onClick={() => {
            setShowDeleteConfirm(false)
            setDeletingListId(null)
          }}>✕</CloseButton>
        </ModalHeader>
        
        <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text)' }}>
          Tem certeza que deseja deletar esta lista? Todos os itens serão removidos permanentemente.
        </p>

        <ModalActions>
          <Button onClick={() => {
            setShowDeleteConfirm(false)
            setDeletingListId(null)
          }}>
            Cancelar
          </Button>
          <Button 
            $variant="danger" 
            onClick={handleDeleteList} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}

export default ListsPage
