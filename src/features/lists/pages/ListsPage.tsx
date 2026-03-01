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
  min-height: -webkit-fill-available;
  background: var(--color-bg);
  background-image: var(--color-bg-gradient-vibrant);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  position: relative;
  overflow-x: hidden;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  &::before {
    content: '';
    position: fixed;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
    z-index: 0;
  }

  &::after {
    content: '';
    position: fixed;
    bottom: -30%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 25s ease-in-out infinite reverse;
    z-index: 0;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50% { transform: translate(30px, -30px) scale(1.1) rotate(5deg); }
  }

  @media (max-width: 480px) {
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px);
  }
`

const Header = styled.header`
  background: var(--color-surface);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  padding: 24px 20px;
  padding-top: max(24px, env(safe-area-inset-top, 24px));
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--shadow-glass);
  transition: all var(--transition-smooth);

  @media (max-width: 480px) {
    padding: 20px 16px;
    padding-top: max(20px, env(safe-area-inset-top, 20px));
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
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
  color: var(--color-text);
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
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-colored);
  transition: all var(--transition-bounce);
  min-height: 52px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
  z-index: 10;
  touch-action: manipulation;

  @media (max-width: 480px) {
    padding: 18px 24px;
    font-size: 1.1rem;
    min-height: 60px;
    border-radius: 18px;
    box-shadow: var(--shadow-colored-lg);
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

  &:hover {
    background: var(--color-primary-gradient-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-colored-lg);
  }

  &:active {
    background: var(--color-primary-dark);
    transform: scale(0.96) translateY(0);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.5), 0 0 0 4px rgba(34, 197, 94, 0.2);
    
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
  background: var(--color-surface-elevated);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px;
  font-size: 1.3rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  pointer-events: auto;
  position: relative;
  z-index: 10;

  &:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text);
  }

  &:active {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(0.92) rotate(5deg);
    color: var(--color-danger);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
  background: var(--color-surface);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-glass);
  cursor: pointer;
  transition: all var(--transition-slow);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: visible;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 20px;
    box-shadow: var(--shadow-glass-strong);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--color-primary-gradient);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-colored-lg), 0 0 0 1px var(--color-primary);
    border-color: var(--color-primary);
  }

  &:active {
    transform: scale(0.98) translateY(2px);
    box-shadow: var(--shadow-colored), 0 0 0 1px var(--color-primary);
    
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
  color: var(--color-text);
  flex: 1;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.4px;
`

const ListActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const IconButton = styled.button`
  background: var(--color-surface-elevated);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 12px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: var(--shadow-sm);
  pointer-events: auto;
  position: relative;
  z-index: 10;

  &:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text);
  }

  &:active {
    background: var(--color-bg-tertiary);
    transform: scale(0.9) rotate(5deg);
    box-shadow: var(--shadow-md);
  }

  &.danger:active {
    color: var(--color-danger);
    background: rgba(239, 68, 68, 0.2);
    transform: scale(0.9) rotate(-5deg);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`

const ItemsPreview = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`

const PreviewItem = styled.div`
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  line-height: 1.6;
  font-weight: 600;
  letter-spacing: -0.2px;
  transition: all 0.2s;
  
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    color: var(--color-primary);
    transform: translateX(4px);
  }
`

const PreviewMore = styled.div`
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin-top: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  opacity: 0.7;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 100px 20px;
  color: var(--color-text-secondary);
  position: relative;
`

const EmptyTitle = styled.h2`
  font-size: 1.75rem;
  margin-bottom: 20px;
  color: var(--color-text);
  font-weight: 800;
  letter-spacing: -0.8px;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const EmptyText = styled.p`
  margin-bottom: 40px;
  font-size: 1.05rem;
  color: var(--color-text-secondary);
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
  background: var(--color-surface);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 28px 28px 0 0;
  padding: 28px;
  padding-bottom: max(28px, env(safe-area-inset-bottom, 28px));
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform var(--transition-slow);
  box-shadow: var(--shadow-2xl), 0 0 0 1px var(--color-border);
  border-top: 1px solid var(--color-border);
  animation: ${props => props.$show ? 'slideInFromBottom 0.3s ease-out' : 'none'};

  @media (max-width: 480px) {
    padding: 24px 20px;
    padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
    border-radius: 24px 24px 0 0;
    max-height: 93vh;
    backdrop-filter: blur(35px) saturate(180%);
    -webkit-backdrop-filter: blur(35px) saturate(180%);
  }

  @media (min-width: 768px) {
    max-width: 520px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: 28px;
    padding-bottom: max(28px, env(safe-area-inset-bottom, 28px));
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
  color: var(--color-text);
`

const CloseButton = styled.button`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  pointer-events: auto;
  position: relative;
  z-index: 1001;

  &:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text);
  }

  &:active {
    background: var(--color-bg-tertiary);
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
  color: var(--color-text);
  font-size: 0.95rem;
`

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--color-surface-elevated);
  color: var(--color-text);
  min-height: 48px;
  transition: all 0.2s;

  &:focus {
    border-color: var(--color-primary);
    outline: none;
    background: var(--color-bg-tertiary);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  }

  &::placeholder {
    color: var(--color-text-secondary);
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
    if (props.$variant === 'primary') return 'var(--color-primary-gradient)'
    if (props.$variant === 'danger') return 'var(--color-danger-gradient)'
    return 'var(--color-surface-elevated)'
  }};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'none' : `2px solid var(--color-border)`)};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  box-shadow: ${props => {
    if (props.$variant === 'primary') return 'var(--shadow-colored)'
    if (props.$variant === 'danger') return '0 4px 12px rgba(239, 68, 68, 0.3)'
    return 'var(--shadow-sm)'
  }};

  &:hover:not(:disabled) {
    ${props => {
      if (props.$variant === 'primary') return 'background: var(--color-primary-gradient-hover); box-shadow: var(--shadow-colored-lg);'
      if (props.$variant === 'danger') return 'background: var(--color-danger); box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);'
      return 'background: var(--color-bg-tertiary);'
    }}
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

function ListsPage() {
  const { signOut, user } = useAuth()
  const { lists, isLoading, createList, renameList, deleteList, isCreating, isDeleting } = useLists()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [listName, setListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [deletingListId, setDeletingListId] = useState<string | null>(null)

  const handleLogout = async () => {
    console.log('✅ handleLogout CHAMADO')
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
    console.log('✅ handleCreateList CHAMADO', listName)
    
    // Validar se o usuário está logado
    if (!user?.uid) {
      console.error('❌ handleCreateList CANCELADO - usuário não autenticado')
      toast.error('Você precisa estar logado para criar uma lista.')
      return
    }

    // Validar se o nome não está vazio
    if (!listName.trim()) {
      console.log('❌ handleCreateList CANCELADO - nome vazio')
      toast.error('O nome da lista é obrigatório.')
      return
    }

    try {
      console.log('✅ Usuário autenticado, criando lista...', { uid: user.uid, name: listName.trim() })
      const newList = await createList(listName.trim())
      setListName('')
      setShowCreateModal(false)
      toast.success('Lista criada!')
      // Navegar para a lista criada
      if (newList?.id) {
        navigate(`/lists/${newList.id}`)
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar lista:', error)
      const errorMessage = error?.message || 'Erro ao criar lista. Tente novamente.'
      toast.error(errorMessage)
    }
  }

  const handleEditList = (listId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('✅ handleEditList CHAMADO', listId, currentName)
    setEditingListId(listId)
    setListName(currentName)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    console.log('✅ handleSaveEdit CHAMADO', editingListId, listName)
    if (!editingListId || !listName.trim()) {
      console.log('❌ handleSaveEdit CANCELADO - dados inválidos')
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
    console.log('✅ handleDeleteList CHAMADO', listId)
    setDeletingListId(listId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    console.log('✅ handleConfirmDelete CHAMADO', deletingListId)
    if (!deletingListId) {
      console.log('❌ handleConfirmDelete CANCELADO - sem ID')
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
              <AddButton 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('✅ Nova Lista CLICADO')
                  setShowCreateModal(true)
                }} 
                disabled={isCreating}
              >
                {isCreating ? '...' : '+ Nova'}
              </AddButton>
              <LogoutButton 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('✅ Logout CLICADO')
                  handleLogout()
                }} 
                title="Sair"
              >
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
              <AddButton 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('✅ Criar Primeira Lista CLICADO')
                  setShowCreateModal(true)
                }} 
                disabled={isCreating}
              >
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
          <CloseButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Fechar Modal Criar Lista')
              setShowCreateModal(false)
            }}
          >✕</CloseButton>
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
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Cancelar Criar Lista')
              setShowCreateModal(false)
              setListName('')
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            $variant="primary" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Criar Lista CLICADO')
              handleCreateList()
            }} 
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
          <CloseButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Fechar Modal Editar Lista')
              setShowEditModal(false)
              setEditingListId(null)
              setListName('')
            }}
          >✕</CloseButton>
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
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Cancelar Editar Lista')
              setShowEditModal(false)
              setEditingListId(null)
              setListName('')
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            $variant="primary" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Salvar Lista CLICADO')
              handleSaveEdit()
            }} 
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
          <CloseButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Fechar Modal Deletar Lista')
              setShowDeleteConfirm(false)
              setDeletingListId(null)
            }}
          >✕</CloseButton>
        </ModalHeader>
        
        <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
          Tem certeza que deseja deletar esta lista? Todos os itens serão removidos permanentemente.
        </p>

        <ModalActions>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Cancelar Deletar Lista')
              setShowDeleteConfirm(false)
              setDeletingListId(null)
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            $variant="danger" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Confirmar Deletar Lista CLICADO')
              handleConfirmDelete()
            }} 
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
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Editar Lista (card) CLICADO', list.id)
              onEdit(list.id, list.name, e)
            }}
            title="Editar"
          >
            ✏️
          </IconButton>
          <IconButton
            type="button"
            className="danger"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Deletar Lista (card) CLICADO', list.id)
              onDelete(list.id, e)
            }}
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
