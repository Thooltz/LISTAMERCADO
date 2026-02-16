import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthProvider'
import { useLists } from '../hooks/useLists'
import { useItemsPreview } from '../hooks/useItemsPreview'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import toast from 'react-hot-toast'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #f5f5f5 100%);
  padding-bottom: 20px;
`

const Header = styled.header`
  background: white;
  padding: 20px 16px;
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
`

const HeaderContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
  letter-spacing: -0.5px;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  letter-spacing: 0.3px;

  &:active {
    transform: scale(0.96) translateY(1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const LogoutButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:active {
    background: #e0e0e0;
    transform: scale(0.95);
    color: #e74c3c;
  }
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px;
`

const ListsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const ListCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s;
  }

  &:active {
    transform: scale(0.98) translateY(2px);
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
    
    &::before {
      transform: scaleX(1);
    }
  }
`

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`

const ListTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.3px;
`

const ListActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const IconButton = styled.button`
  background: #f8f9fa;
  border: none;
  font-size: 1.15rem;
  cursor: pointer;
  color: #666;
  padding: 10px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    background: #e9ecef;
    transform: scale(0.92);
  }

  &.danger:active {
    color: #e74c3c;
    background: #fee;
  }
`

const ItemsPreview = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`

const PreviewItem = styled.div`
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 8px;
  line-height: 1.6;
  font-weight: 500;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const PreviewMore = styled.div`
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
  margin-top: 8px;
  font-weight: 500;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999;
`

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #666;
  font-weight: 700;
  letter-spacing: -0.5px;
`

const EmptyText = styled.p`
  margin-bottom: 32px;
  font-size: 1rem;
  color: #888;
  line-height: 1.6;
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

function ListsPage() {
  const { signOut } = useAuth()
  const { lists, isLoading, createList, renameList, deleteList, isCreating, isDeleting } = useLists()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [listName, setListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [deletingListId, setDeletingListId] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logout realizado!')
      navigate('/auth')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const handleCreateList = async () => {
    if (!listName.trim()) {
      return
    }

    try {
      const newList = await createList(listName.trim())
      setListName('')
      setShowCreateModal(false)
      toast.success('Lista criada!')
      // Navegar para a lista criada
      if (newList?.id) {
        navigate(`/lists/${newList.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error)
    }
  }

  const handleEditList = (listId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
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
      toast.success('Lista renomeada!')
    } catch (error) {
      console.error('Erro ao renomear lista:', error)
    }
  }

  const handleDeleteList = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingListId(listId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingListId) {
      return
    }

    try {
      await deleteList(deletingListId)
      setShowDeleteConfirm(false)
      setDeletingListId(null)
      toast.success('Lista deletada!')
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
          <HeaderContent>
            <Title>Minhas Listas</Title>
            <HeaderActions>
              <AddButton onClick={() => setShowCreateModal(true)} disabled={isCreating}>
                {isCreating ? '...' : '+ Nova'}
              </AddButton>
              <LogoutButton onClick={handleLogout} title="Sair">
                🚪
              </LogoutButton>
            </HeaderActions>
          </HeaderContent>
        </Header>

        <Content>
          {lists.length === 0 ? (
            <EmptyState>
              <EmptyTitle>Nenhuma lista ainda</EmptyTitle>
              <EmptyText>Crie sua primeira lista para começar!</EmptyText>
              <AddButton onClick={() => setShowCreateModal(true)} disabled={isCreating}>
                {isCreating ? 'Criando...' : '+ Criar primeira lista'}
              </AddButton>
            </EmptyState>
          ) : (
            <ListsContainer>
              {lists.map(list => (
                <ListCardWithPreview 
                  key={list.id} 
                  list={list} 
                  onEdit={handleEditList} 
                  onDelete={handleDeleteList} 
                  onNavigate={() => navigate(`/lists/${list.id}`)} 
                />
              ))}
            </ListsContainer>
          )}
        </Content>
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
        
        <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
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
            onClick={handleConfirmDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}

// Componente para card com preview de itens
function ListCardWithPreview({ 
  list, 
  onEdit, 
  onDelete, 
  onNavigate 
}: { 
  list: { id: string; name: string; updatedAt: Date }
  onEdit: (listId: string, name: string, e: React.MouseEvent) => void
  onDelete: (listId: string, e: React.MouseEvent) => void
  onNavigate: () => void
}) {
  const { items, total, isLoading } = useItemsPreview(list.id)
  const previewItems = items.slice(0, 3) // Mostrar até 3 itens no preview
  const remaining = total - previewItems.length

  return (
    <ListCard onClick={onNavigate}>
      <ListHeader>
        <ListTitle>{list.name}</ListTitle>
        <ListActions onClick={(e) => e.stopPropagation()}>
          <IconButton
            onClick={(e) => onEdit(list.id, list.name, e)}
            title="Editar"
          >
            ✏️
          </IconButton>
          <IconButton
            className="danger"
            onClick={(e) => onDelete(list.id, e)}
            title="Deletar"
          >
            🗑️
          </IconButton>
        </ListActions>
      </ListHeader>
      
      {!isLoading && total > 0 && (
        <ItemsPreview>
          {previewItems.map(item => (
            <PreviewItem key={item.id}>
              • {item.name} {item.qty > 1 ? `(${item.qty})` : ''}
            </PreviewItem>
          ))}
          {remaining > 0 && (
            <PreviewMore>+{remaining} {remaining === 1 ? 'item' : 'itens'}…</PreviewMore>
          )}
        </ItemsPreview>
      )}
    </ListCard>
  )
}

export default ListsPage
