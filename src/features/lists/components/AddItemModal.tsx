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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: var(--spacing-md);
`

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: var(--spacing-md);
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
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface AddItemModalProps {
  show: boolean
  onClose: () => void
  onSave: (name: string, quantity?: number, unit?: string) => Promise<void>
  isSaving?: boolean
}

export function AddItemModal({ show, onClose, onSave, isSaving = false }: AddItemModalProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('un')

  useEffect(() => {
    if (show) {
      setName('')
      setQuantity('1')
      setUnit('un')
    }
  }, [show])

  const handleSave = async () => {
    if (!name.trim()) {
      return
    }

    try {
      await onSave(
        name.trim(),
        parseInt(quantity) || 1,
        unit || 'un'
      )
      onClose()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
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
          <ModalTitle>Adicionar Item</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        
        <FormGroup>
          <Label>Nome do item *</Label>
          <Input
            type="text"
            placeholder="Ex: Arroz"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <Label>Quantidade e unidade (opcional)</Label>
          <Row>
            <Input
              type="number"
              placeholder="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min="1"
              onKeyDown={handleKeyDown}
            />
            <Input
              type="text"
              placeholder="un"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Row>
        </FormGroup>

        <ModalActions>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? 'Salvando...' : 'Salvar item'}
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}
