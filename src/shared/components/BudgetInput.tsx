import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { parseBRMoneyToNumber, formatNumberToBRMoney } from '../utils/money'

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 0.5);
  border-radius: 14px;
  font-size: 16px; /* Mínimo 16px para evitar zoom no iOS */
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  font-weight: 600;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;

  &:focus {
    border-color: #667eea;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  &::placeholder {
    color: #999;
  }

  @media (max-width: 480px) {
    padding: 14px 18px;
    font-size: 16px;
    min-height: 52px;
  }
`

interface BudgetInputProps {
  value: number | null | undefined
  onChange: (value: number | null) => void
  onRawChange?: (rawValue: string) => void
  onEditingChange?: (isEditing: boolean) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * Componente de input de orçamento mobile-first com autosave
 * - Mantém valor como STRING enquanto digita (controlled input)
 * - Permite edição livre (apagar, trocar dígitos, mover cursor)
 * - Teclado numérico no mobile (inputMode="decimal")
 * - Não formata com R$ dentro do input enquanto digita
 * - Bloqueia sincronização do Firestore durante edição
 */
export function BudgetInput({
  value,
  onChange,
  onRawChange,
  onEditingChange,
  placeholder = 'Quanto você tem para gastar?',
  disabled = false,
  className,
  style,
}: BudgetInputProps) {
  // Estado interno: mantém como STRING enquanto digita
  const [inputValue, setInputValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isEditingRef = useRef(false)

  // Sincroniza com o valor externo quando muda (mas NUNCA durante edição)
  useEffect(() => {
    // Só atualiza se NÃO estiver editando
    if (!isEditingRef.current) {
      const formatted = formatNumberToBRMoney(value)
      setInputValue(formatted)
    }
  }, [value])

  const handleFocus = () => {
    isEditingRef.current = true
    if (onEditingChange) {
      onEditingChange(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    // Permite apenas dígitos, vírgula e ponto
    let cleaned = rawValue.replace(/[^\d,.]/g, '')

    // Garante apenas uma vírgula (decimal)
    const commaIndex = cleaned.indexOf(',')
    if (commaIndex !== -1) {
      cleaned = cleaned.substring(0, commaIndex + 1) + cleaned.substring(commaIndex + 1).replace(/,/g, '')
    }

    // Limita a 2 casas decimais após a vírgula
    if (commaIndex !== -1) {
      const parts = cleaned.split(',')
      if (parts[1] && parts[1].length > 2) {
        cleaned = parts[0] + ',' + parts[1].substring(0, 2)
      }
    }

    // Atualiza o estado interno (STRING) - sempre permitido
    setInputValue(cleaned)
    
    // Notifica mudança raw (para debounce externo)
    if (onRawChange) {
      onRawChange(cleaned)
    }
  }

  const handleBlur = () => {
    isEditingRef.current = false
    if (onEditingChange) {
      onEditingChange(false)
    }

    // Converte STRING para number apenas no onBlur
    const numValue = parseBRMoneyToNumber(inputValue)
    onChange(numValue)
    
    // Se o valor for válido, formata para exibição
    if (numValue !== null) {
      setInputValue(formatNumberToBRMoney(numValue))
    } else {
      setInputValue('')
    }
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
      style={style}
    />
  )
}
