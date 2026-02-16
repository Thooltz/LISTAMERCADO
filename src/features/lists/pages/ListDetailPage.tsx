import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useList } from '../hooks/useList'
import { useItems } from '../../items/hooks/useItems'
import { useLists } from '../hooks/useLists'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import toast from 'react-hot-toast'
import { getSuggestion, getDefaultUnit } from '../../../shared/utils/suggestions'

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
    z-index: 0;
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
    z-index: 0;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.1); }
  }
`

const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 100;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transition: all var(--transition-base);
`

const HeaderContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackButton = styled.button`
  background: rgba(245, 245, 245, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.3rem;
  cursor: pointer;
  color: #1a1a1a;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:active {
    background: rgba(233, 236, 239, 0.9);
    transform: scale(0.92) rotate(-5deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  flex: 1;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`

const IconButton = styled.button`
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.1rem;
  cursor: pointer;
  color: #666;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all var(--transition-base);
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

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  position: relative;
  z-index: 1;
`

const AddButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 18px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0);
  transition: all var(--transition-bounce);
  margin-bottom: 20px;
  min-height: 56px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;

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

const StatsBar = styled.div`
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  box-shadow: var(--shadow-glass);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeIn 0.5s ease-out;
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-weight: 800;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
`

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #999;
`

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const ItemCard = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  box-shadow: var(--shadow-glass);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all var(--transition-slow);
  opacity: ${props => (props.checked ? 0.65 : 1)};
  min-height: 76px;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.4s ease-out;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform var(--transition-base);
    border-radius: 0 4px 4px 0;
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
    transition: opacity var(--transition-base);
  }

  &:active {
    transform: scale(0.97) translateY(2px);
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.2), 0 0 0 1px rgba(102, 126, 234, 0.1);
    
    &::before {
      transform: scaleY(1);
    }

    &::after {
      opacity: 1;
    }
  }
`

const Checkbox = styled.input`
  width: 26px;
  height: 26px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #667eea;
  border-radius: 6px;
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
  font-size: 1.05rem;
  text-decoration: ${props => (props.checked ? 'line-through' : 'none')};
  color: ${props => (props.checked ? '#999' : '#1a1a1a')};
  flex: 1;
  min-width: 0;
  word-break: break-word;
  letter-spacing: -0.2px;
  line-height: 1.5;
`

const ItemQty = styled.span`
  font-size: 0.9rem;
  color: #999;
  white-space: nowrap;
`

const UnitBadge = styled.div<{ $isUn?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$isUn ? '8px 14px' : '6px 12px'};
  background: ${props => props.$isUn 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%)'};
  color: ${props => props.$isUn ? '#ffffff' : '#667eea'};
  font-size: ${props => props.$isUn ? '0.95rem' : '0.85rem'};
  font-weight: ${props => props.$isUn ? '700' : '600'};
  border-radius: ${props => props.$isUn ? '12px' : '10px'};
  white-space: nowrap;
  box-shadow: ${props => props.$isUn 
    ? '0 2px 8px rgba(102, 126, 234, 0.3)' 
    : '0 1px 4px rgba(102, 126, 234, 0.15)'};
  min-width: ${props => props.$isUn ? '48px' : '40px'};
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    padding: ${props => props.$isUn ? '10px 16px' : '8px 14px'};
    font-size: ${props => props.$isUn ? '1rem' : '0.9rem'};
    min-width: ${props => props.$isUn ? '52px' : '44px'};
  }
`

const QtyAndUnitContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const ActionButton = styled.button`
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  transition: all var(--transition-base);
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: 28px 28px 0 0;
  padding: 28px;
  max-height: 85vh;
  overflow-y: auto;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform var(--transition-slow);
  box-shadow: 0 -8px 32px rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.3);

  @media (min-width: 768px) {
    max-width: 520px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: 28px;
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
  background: rgba(245, 245, 245, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:active {
    background: rgba(233, 236, 239, 0.9);
    transform: scale(0.9) rotate(90deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  padding: 16px;
  border: 2px solid rgba(224, 224, 224, 0.5);
  border-radius: 16px;
  font-size: 1rem;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  min-height: 52px;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:focus {
    border-color: #667eea;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }
`

const Select = styled.select`
  width: 100%;
  padding: 16px;
  border: 2px solid rgba(224, 224, 224, 0.5);
  border-radius: 16px;
  font-size: 1rem;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  min-height: 52px;
  transition: all var(--transition-base);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:focus {
    border-color: #667eea;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 16px;
  background: ${props => {
    if (props.$variant === 'primary') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    if (props.$variant === 'danger') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    return 'rgba(245, 245, 245, 0.8)'
  }};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : '#1a1a1a')};
  border: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'none' : '2px solid rgba(224, 224, 224, 0.5)')};
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 52px;
  backdrop-filter: ${props => props.$variant === 'secondary' ? 'blur(10px)' : 'none'};
  box-shadow: ${props => {
    if (props.$variant === 'primary') return '0 4px 12px rgba(102, 126, 234, 0.3)'
    if (props.$variant === 'danger') return '0 4px 12px rgba(239, 68, 68, 0.3)'
    return '0 2px 8px rgba(0, 0, 0, 0.05)'
  }};

  &:active:not(:disabled) {
    transform: scale(0.96);
    box-shadow: ${props => {
      if (props.$variant === 'primary') return '0 2px 8px rgba(102, 126, 234, 0.4), 0 0 0 3px rgba(102, 126, 234, 0.2)'
      if (props.$variant === 'danger') return '0 2px 8px rgba(239, 68, 68, 0.4), 0 0 0 3px rgba(239, 68, 68, 0.2)'
      return '0 1px 4px rgba(0, 0, 0, 0.1)'
    }};
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
  const [itemUnit, setItemUnit] = useState('un')
  const [itemCategory, setItemCategory] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [listName, setListName] = useState('')

  // Sugestões automáticas quando o nome do item muda
  useEffect(() => {
    if (itemName.trim() && !editingItemId) {
      const suggestion = getSuggestion(itemName.trim())
      if (suggestion) {
        setItemUnit(suggestion.unit)
        setItemCategory(suggestion.category)
      } else {
        setItemUnit(getDefaultUnit())
        setItemCategory('')
      }
    }
  }, [itemName, editingItemId])

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
        unit: itemUnit || undefined,
        category: itemCategory || undefined,
      })
      setItemName('')
      setItemQty('1')
      setItemUnit('un')
      setItemCategory('')
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
    setItemUnit(item.unit || 'un')
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
      setItemQty('1')
      setItemUnit('un')
      setItemCategory('')
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
                    {(item.qty || item.unit) && (
                      <QtyAndUnitContainer>
                        {item.qty && <ItemQty>{item.qty}</ItemQty>}
                        {item.unit && (
                          <UnitBadge $isUn={item.unit === 'un'}>
                            {item.unit}
                          </UnitBadge>
                        )}
                      </QtyAndUnitContainer>
                    )}
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
            setItemUnit('un')
            setItemCategory('')
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

        <FormGroup>
          <Label>Unidade</Label>
          <Select
            value={itemUnit}
            onChange={e => setItemUnit(e.target.value)}
          >
            <option value="un">Unidade (un)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="g">Grama (g)</option>
            <option value="L">Litro (L)</option>
            <option value="mL">Mililitro (mL)</option>
            <option value="cx">Caixa (cx)</option>
            <option value="pct">Pacote (pct)</option>
            <option value="lata">Lata</option>
          </Select>
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowAddItemModal(false)
            setItemName('')
            setItemQty('1')
            setItemUnit('un')
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
            setItemQty('1')
            setItemUnit('un')
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
          <Label>Unidade</Label>
          <Select
            value={itemUnit}
            onChange={e => setItemUnit(e.target.value)}
          >
            <option value="un">Unidade (un)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="g">Grama (g)</option>
            <option value="L">Litro (L)</option>
            <option value="mL">Mililitro (mL)</option>
            <option value="cx">Caixa (cx)</option>
            <option value="pct">Pacote (pct)</option>
            <option value="lata">Lata</option>
          </Select>
        </FormGroup>

        <ModalActions>
          <Button onClick={() => {
            setShowEditItemModal(false)
            setEditingItemId(null)
            setItemName('')
            setItemQty('1')
            setItemUnit('un')
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
