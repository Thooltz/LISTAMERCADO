import { useState, useEffect } from 'react'
import styled from 'styled-components'

const BottomSheet = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-xl);
  max-height: 85vh;
  overflow-y: auto;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease-out;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);

  @media (min-width: 768px) {
    max-width: 500px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: var(--radius-lg);
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
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  width: 100%;
  padding: var(--spacing-md);
  background: ${props => {
    if (props.$variant === 'primary') return 'var(--color-primary)'
    if (props.$variant === 'danger') return 'var(--color-danger)'
    return 'var(--color-bg-secondary)'
  }};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger' ? 'white' : 'var(--color-text)')};
  border: ${props => (props.$variant ? 'none' : '2px solid var(--color-border)')};
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface EditListModalProps {
  show: boolean
  onClose: () => void
  onSave: (title: string) => Promise<void>
  onDelete?: () => Promise<void>
  currentTitle: string
  isSaving?: boolean
  isDeleting?: boolean
}

export function EditListModal({ 
  show, 
  onClose, 
  onSave, 
  onDelete,
  currentTitle, 
  isSaving = false,
  isDeleting = false
}: EditListModalProps) {
  const [title, setTitle] = useState(currentTitle)

  useEffect(() => {
    if (show) {
      setTitle(currentTitle)
    }
  }, [show, currentTitle])

  const handleSave = async () => {
    if (!title.trim() || title.trim() === currentTitle) {
      onClose()
      return
    }

    try {
      await onSave(title.trim())
      onClose()
    } catch (error) {
      console.error('Erro ao salvar lista:', error)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (window.confirm('Tem certeza que deseja excluir esta lista? Todos os itens serão removidos.')) {
      try {
        await onDelete()
        onClose()
      } catch (error) {
        console.error('Erro ao deletar lista:', error)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <>
      <Overlay $show={show} onClick={onClose} />
      <BottomSheet $show={show} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Lista</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome da lista</Label>
          <Input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </FormGroup>

        <ModalActions>
          {onDelete && (
            <Button 
              $variant="danger" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir lista'}
            </Button>
          )}
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSave} 
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}
