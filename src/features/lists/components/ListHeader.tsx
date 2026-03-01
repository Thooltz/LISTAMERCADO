import { useEffect, useState, type MouseEvent } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useLists } from '../hooks/useLists'

type ListHeaderProps = {
  listId: string
  name: string
  onBack?: () => void
}

const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  background: var(--color-surface);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  z-index: 10000;
  padding: 16px 12px;
  padding-top: max(16px, env(safe-area-inset-top, 16px));
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-glass);
  pointer-events: auto;
  isolation: isolate;
  transition: all var(--transition-smooth);

  @media (max-width: 480px) {
    padding: 18px 16px;
    padding-top: max(18px, env(safe-area-inset-top, 18px));
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
  }
`

const HeaderContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 10001;
  pointer-events: auto;
`

const BackButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 10002;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  color: var(--color-text-secondary);
  
  @media (max-width: 480px) {
    min-width: 48px;
    min-height: 48px;
  }
  
  &:active {
    transform: scale(0.95);
    background: var(--color-bg-tertiary);
  }
  
  &:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text);
  }
`

const Title = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
  color: var(--color-text);
`

const NameInput = styled.input`
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  padding: 8px 12px;
  font-size: 1rem;
  pointer-events: auto;
  position: relative;
  z-index: 202;

  &:focus {
    border-color: var(--color-primary);
    outline: none;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  pointer-events: auto;
  position: relative;
  z-index: 202;
`

const IconButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 10003;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  color: var(--color-text-secondary);
  
  @media (max-width: 480px) {
    min-width: 48px;
    min-height: 48px;
  }
  
  &:active {
    transform: scale(0.95);
    background: var(--color-bg-tertiary);
  }
  
  &:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`

const ErrorText = styled.p`
  max-width: 600px;
  margin: 8px auto 0;
  color: var(--color-danger);
  font-size: 0.9rem;
`

export default function ListHeader({ listId, name, onBack }: ListHeaderProps) {
  const navigate = useNavigate()
  const { renameList, deleteList } = useLists()
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optimisticName, setOptimisticName] = useState(name)

  useEffect(() => {
    if (!isEditing) {
      setDraftName(name)
      setOptimisticName(name)
    }
  }, [name, isEditing])

  const startEditListName = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ startEditListName CLICADO', listId)
    setError(null)
    setDraftName(optimisticName)
    setIsEditing(true)
  }

  const cancelEditListName = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ cancelEditListName CLICADO', listId)
    setError(null)
    setDraftName(optimisticName)
    setIsEditing(false)
  }

  const saveListName = async (
    e: MouseEvent<HTMLButtonElement>,
    id: string,
    newName: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ saveListName CLICADO', id, newName)
    const trimmed = newName.trim()
    if (!trimmed) {
      console.log('❌ saveListName CANCELADO - nome vazio')
      setError('Nome da lista é obrigatório')
      return
    }

    const previous = optimisticName
    setError(null)
    setLoading(true)
    setOptimisticName(trimmed)

    try {
      console.log('✅ saveListName - chamando renameList', { id, name: trimmed })
      await renameList({ id, name: trimmed })
      console.log('✅ saveListName - sucesso')
      setIsEditing(false)
    } catch (err: any) {
      console.error('❌ saveListName error:', err)
      setOptimisticName(previous)
      setError(err?.message || 'Erro ao salvar nome da lista')
    } finally {
      setLoading(false)
    }
  }

  const deleteListById = async (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ deleteList CLICADO', id)
    const confirmed = window.confirm('Deseja excluir a lista inteira? Os itens vinculados também serão removidos.')
    if (!confirmed) {
      console.log('❌ deleteList CANCELADO pelo usuário')
      return
    }

    setError(null)
    setLoading(true)
    try {
      console.log('✅ deleteList - chamando deleteList', id)
      await deleteList(id)
      console.log('✅ deleteList - sucesso, navegando para /lists')
      navigate('/lists')
    } catch (err: any) {
      console.error('❌ deleteList error:', err)
      setError(err?.message || 'Erro ao excluir lista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StickyHeader>
      <HeaderContent>
        <BackButton
          type="button"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            console.log('✅ BackButton CLICADO', listId)
            if (onBack) {
              console.log('✅ BackButton - usando onBack callback')
              onBack()
            } else {
              console.log('✅ BackButton - navegando para /lists')
              navigate('/lists')
            }
          }}
          onPointerDown={e => {
            e.stopPropagation()
          }}
          onTouchStart={e => {
            e.stopPropagation()
          }}
          onTouchEnd={e => {
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-label="Voltar para listas"
        >
          ←
        </BackButton>

        {isEditing ? (
          <NameInput
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            disabled={loading}
            autoFocus
          />
        ) : (
          <Title>{optimisticName}</Title>
        )}

        <Actions>
          {isEditing ? (
            <>
              <IconButton
                type="button"
                title="Salvar"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  saveListName(e, listId, draftName)
                }}
                onPointerDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                disabled={loading}
                aria-label="Salvar nome da lista"
              >
                ✅
              </IconButton>
              <IconButton
                type="button"
                title="Cancelar"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  cancelEditListName(e)
                }}
                onPointerDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                disabled={loading}
                aria-label="Cancelar edição"
              >
                ✕
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                type="button"
                title="Editar nome da lista"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  startEditListName(e)
                }}
                onPointerDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                disabled={loading}
                aria-label="Editar nome da lista"
              >
                ✏️
              </IconButton>
              <IconButton
                type="button"
                title="Excluir lista"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  deleteListById(e, listId)
                }}
                onPointerDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                disabled={loading}
                aria-label="Excluir lista"
              >
                🗑️
              </IconButton>
            </>
          )}
        </Actions>
      </HeaderContent>

      {error && <ErrorText>{error}</ErrorText>}
    </StickyHeader>
  )
}
