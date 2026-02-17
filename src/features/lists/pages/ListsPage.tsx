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
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #f8f9fa 100%);
  padding-bottom: 20px;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: fixed;
    bottom: -30%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 25s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.1); }
  }
`

const Header = styled.header`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 24px 20px;
  padding-top: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);

  @media (max-width: 480px) {
    padding: 20px 16px;
    padding-top: 20px;
  }
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
  border-radius: 16px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 52px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 480px) {
    padding: 16px 20px;
    font-size: 1.05rem;
    min-height: 56px;
    border-radius: 14px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5), 0 0 0 4px rgba(102, 126, 234, 0.2);
    
    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const LogoutButton = styled.button`
  background: rgba(245, 245, 245, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  padding: 12px;
  font-size: 1.3rem;
  cursor: pointer;
  color: #666;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:active {
    background: rgba(231, 76, 60, 0.1);
    transform: scale(0.92) rotate(5deg);
    color: #e74c3c;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
  }
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px;
  padding-bottom: 24px;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 20px 16px;
    padding-bottom: 20px;
  }
`

const ListsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const ListCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
  }

  &:active {
    transform: scale(0.97) translateY(4px);
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.2), 0 0 0 1px rgba(102, 126, 234, 0.1);
    
    &::before {
      transform: scaleX(1);
    }

    &::after {
      opacity: 1;
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
  font-size: 1.2rem;
  font-weight: 800;
  color: #1a1a1a;
  flex: 1;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.4px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const ListActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const IconButton = styled.button`
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 12px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:active {
    background: rgba(233, 236, 239, 0.9);
    transform: scale(0.9) rotate(5deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.danger:active {
    color: #e74c3c;
    background: rgba(254, 238, 238, 0.9);
    transform: scale(0.9) rotate(-5deg);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
  }
`

const ItemsPreview = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`

const PreviewItem = styled.div`
  font-size: 1rem;
  color: #555;
  margin-bottom: 10px;
  line-height: 1.6;
  font-weight: 600;
  letter-spacing: -0.2px;
  transition: all 0.2s;
  
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    color: #667eea;
    transform: translateX(4px);
  }
`

const PreviewMore = styled.div`
  font-size: 0.95rem;
  color: #999;
  font-style: italic;
  margin-top: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 100px 20px;
  color: #999;
  position: relative;
`

const EmptyTitle = styled.h2`
  font-size: 1.75rem;
  margin-bottom: 20px;
  color: #666;
  font-weight: 800;
  letter-spacing: -0.8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const EmptyText = styled.p`
  margin-bottom: 40px;
  font-size: 1.05rem;
  color: #888;
  line-height: 1.7;
  font-weight: 500;
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  padding-bottom: 24px;
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -8px 32px rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 480px) {
    padding: 20px;
    padding-bottom: 20px;
    border-radius: 20px 20px 0 0;
    max-height: 92vh;
  }

  @media (min-width: 768px) {
    max-width: 500px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: 24px;
    padding-bottom: 24px;
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
