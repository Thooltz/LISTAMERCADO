import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { parseBRMoneyToNumber, formatNumberToBRMoney } from '../utils/money'

const Input = styled.input`
  width: 90px;
  padding: 8px 12px;
  border: 2px solid rgba(224, 224, 224, 0.5);
  border-radius: 12px;
  font-size: 0.9rem;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  font-weight: 600;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  text-align: right;

  &:focus {
    border-color: #667eea;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  @media (max-width: 480px) {
    width: 100px;
    padding: 10px 14px;
    font-size: 0.95rem;
  }
`

interface PriceInputProps {
  value: number | null | undefined
  onChange: (value: number | null) => void
  onRawChange?: (rawValue: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void
  onPointerDown?: (e: React.PointerEvent<HTMLInputElement>) => void
  onTouchStart?: (e: React.TouchEvent<HTMLInputElement>) => void
}

/**
 * Componente de input de preço otimizado para mobile
 * - Mantém valor como STRING enquanto digita (controlled input)
 * - Converte para number apenas no onBlur
 * - Permite edição livre (apagar, trocar dígitos, mover cursor)
 * - Teclado numérico no mobile (inputMode="decimal")
 */
export function PriceInput({
  value,
  onChange,
  onRawChange,
  placeholder = '0,00',
  disabled = false,
  className,
  style,
  onClick,
  onPointerDown,
  onTouchStart,
}: PriceInputProps) {
  // Estado interno: mantém como STRING enquanto digita
  const [inputValue, setInputValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincroniza com o valor externo quando muda (mas não durante edição)
  useEffect(() => {
    // Só atualiza se o valor externo mudou E o input não está em foco
    if (document.activeElement !== inputRef.current) {
      const formatted = formatNumberToBRMoney(value)
      setInputValue(formatted)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    // Permite apenas dígitos e vírgula
    let cleaned = rawValue.replace(/[^\d,]/g, '')

    // Garante apenas uma vírgula
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

    // Atualiza o estado interno (STRING)
    setInputValue(cleaned)
    
    // Notifica mudança raw (para debounce externo)
    if (onRawChange) {
      onRawChange(cleaned)
    }
  }

  const handleBlur = () => {
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

  const handleFocus = () => {
    // Quando foca, mostra o valor cru (sem formatação extra)
    // O valor já está como string, então não precisa fazer nada
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      className={className}
      style={style}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onTouchStart={onTouchStart}
    />
  )
}
