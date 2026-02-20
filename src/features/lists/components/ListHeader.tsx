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
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 10000;
  padding: 14px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  pointer-events: auto;
  isolation: isolate;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(245, 245, 245, 0.9);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 10002;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:active {
    transform: scale(0.95);
    background: rgba(233, 236, 239, 0.9);
  }
  
  &:hover {
    background: rgba(233, 236, 239, 0.95);
  }
`

const Title = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
  color: #1a1a1a;
`

const NameInput = styled.input`
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 2px solid rgba(224, 224, 224, 0.7);
  padding: 8px 12px;
  font-size: 1rem;
  pointer-events: auto;
  position: relative;
  z-index: 202;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(245, 245, 245, 0.9);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 10003;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:active {
    transform: scale(0.95);
    background: rgba(233, 236, 239, 0.9);
  }
  
  &:hover {
    background: rgba(233, 236, 239, 0.95);
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
  color: #dc2626;
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
          onMouseDown={e => {
            e.stopPropagation()
          }}
          onTouchStart={e => {
            e.stopPropagation()
          }}
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
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                disabled={loading}
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
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                disabled={loading}
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
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                disabled={loading}
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
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                disabled={loading}
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
