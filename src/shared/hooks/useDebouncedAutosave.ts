import { useEffect, useRef } from 'react'

/**
 * Hook para autosave com debounce
 * Salva automaticamente após X segundos sem digitar
 * Cancela o timer anterior se continuar digitando
 */
export function useDebouncedAutosave<T>(
  value: T,
  onSave: (value: T) => void | Promise<void>,
  delay: number = 2000,
  enabled: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<T | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Se o valor não mudou, não precisa salvar
    if (value === lastSavedRef.current) {
      return
    }

    // Limpar timer anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Criar novo timer
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(value)
        lastSavedRef.current = value
      } catch (error) {
        console.error('Erro no autosave:', error)
      }
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSave, delay, enabled])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}
