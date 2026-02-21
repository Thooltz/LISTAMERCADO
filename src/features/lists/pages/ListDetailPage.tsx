import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useList } from '../hooks/useList'
import { useItems } from '../../items/hooks/useItems'
import { useAuth } from '../../auth/context/AuthProvider'
import styled from 'styled-components'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import toast from 'react-hot-toast'
import { getSuggestion, getDefaultUnit } from '../../../shared/utils/suggestions'
import ListHeader from '../components/ListHeader'
import { PriceInput } from '../../../shared/components/PriceInput'
import { BudgetInput } from '../../../shared/components/BudgetInput'
import { useDebouncedAutosave } from '../../../shared/hooks/useDebouncedAutosave'
import { updateBudget } from '../../../services/listService'
import { parseBRMoneyToNumber } from '../../../shared/utils/money'

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

const Content = styled.div<{ hasFooter?: boolean }>`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: ${props => props.hasFooter ? '90px' : '16px'};
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 16px;
    padding-bottom: ${props => props.hasFooter ? '90px' : '16px'};
  }
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
  -webkit-tap-highlight-color: transparent;

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

  @media (max-width: 480px) {
    padding: 20px;
    font-size: 1.1rem;
    min-height: 60px;
    border-radius: 18px;
    margin-bottom: 16px;
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

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
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

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #999;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`

const ItemCard = styled.div<{ checked: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  box-shadow: var(--shadow-glass);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all var(--transition-slow);
  opacity: ${props => (props.checked ? 0.65 : 1)};
  position: relative;
  overflow: hidden;
  animation: slideUp 0.4s ease-out;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
  touch-action: manipulation;

  @media (max-width: 480px) {
    padding: 16px;
    gap: 10px;
    border-radius: 16px;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }

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
    pointer-events: none;
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
    pointer-events: none;
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
  width: 28px;
  height: 28px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #667eea;
  border-radius: 8px;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--transition-base);
  touch-action: manipulation;
  pointer-events: auto;
  position: relative;
  z-index: 100;
  -webkit-appearance: checkbox;
  appearance: checkbox;

  &:active {
    transform: scale(0.9);
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    min-width: 32px;
    min-height: 32px;
  }
`

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  pointer-events: auto;
  position: relative;
  z-index: 50;
  grid-column: 2;
  grid-row: 1 / 3;

  @media (max-width: 480px) {
    gap: 6px;
    grid-row: 1;
  }
`

const ItemTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
`

const ItemBottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 480px) {
    grid-column: 1 / 4;
    grid-row: 2;
    margin-top: 4px;
  }
`

const ItemName = styled.span<{ checked: boolean }>`
  font-weight: 600;
  font-size: 1.05rem;
  text-decoration: ${props => (props.checked ? 'line-through' : 'none')};
  color: ${props => (props.checked ? '#999' : '#1a1a1a')};
  flex: 1;
  min-width: 0;
  letter-spacing: -0.2px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  hyphens: auto;

  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`

const ItemQty = styled.span`
  font-size: 0.9rem;
  color: #999;
  white-space: nowrap;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
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
  -webkit-tap-highlight-color: transparent;
  
  @media (max-width: 480px) {
    padding: ${props => props.$isUn ? '10px 16px' : '8px 14px'};
    font-size: ${props => props.$isUn ? '1rem' : '0.9rem'};
    min-width: ${props => props.$isUn ? '52px' : '44px'};
    border-radius: ${props => props.$isUn ? '14px' : '12px'};
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
  pointer-events: auto;
  position: relative;
  z-index: 150;
  touch-action: manipulation;
  grid-column: 3;
  grid-row: 1;
  align-self: start;
  flex-direction: column;

  @media (max-width: 480px) {
    gap: 6px;
    flex-direction: row;
    grid-column: 2;
    grid-row: 1;
    justify-content: flex-end;
  }
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
  pointer-events: auto;
  position: relative;
  z-index: 200;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  box-sizing: border-box;

  @media (max-width: 480px) {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
    font-size: 1rem;
  }

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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
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

const TotalFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding: 16px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 480px) {
    padding: 16px;
  }
`

const TotalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TotalLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #666;
`

const TotalValue = styled.span<{ $isExceeded?: boolean }>`
  font-size: 1.4rem;
  font-weight: 800;
  background: ${props => props.$isExceeded 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`


const RemainingValue = styled.span<{ $isExceeded: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$isExceeded ? '#ef4444' : '#10b981'};
`

const BudgetCard = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 50;
  margin-top: 16px;
  margin-bottom: 16px;
  pointer-events: auto;

  @media (max-width: 480px) {
    border-radius: 16px;
    margin-top: 12px;
    margin-bottom: 12px;
  }
`

const BudgetHeader = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 14px 16px;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  position: relative;
  z-index: 60;
  transition: background-color 0.2s ease;
  pointer-events: auto;

  &:active {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    min-height: 56px;
  }
`

const BudgetHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`

const BudgetHeaderText = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`

const BudgetMini = styled.span`
  font-size: 12px;
  opacity: 0.7;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`

const BudgetToggleIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 18px;
  transition: transform 0.25s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  display: inline-block;
  flex-shrink: 0;
  margin-left: 12px;
  color: #666;
`

const BudgetContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '400px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${props => props.$isOpen ? '0 16px 16px 16px' : '0 16px'};

  @media (max-width: 480px) {
    padding: ${props => props.$isOpen ? '0 16px 16px 16px' : '0 16px'};
  }
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
  padding-bottom: 28px;
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 1000;
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform var(--transition-slow);
  box-shadow: 0 -8px 32px rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 480px) {
    padding: 24px 20px;
    padding-bottom: 24px;
    border-radius: 24px 24px 0 0;
    max-height: 92vh;
  }

  @media (min-width: 768px) {
    max-width: 520px;
    left: 50%;
    transform: ${props => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')};
    border-radius: 28px;
    padding-bottom: 28px;
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
  pointer-events: auto;
  position: relative;
  z-index: 1001;

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
  font-size: 16px;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  min-height: 52px;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    border-color: #667eea;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 18px;
    min-height: 56px;
    font-size: 16px;
    border-radius: 14px;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 16px;
  border: 2px solid rgba(224, 224, 224, 0.5);
  border-radius: 16px;
  font-size: 16px;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  min-height: 52px;
  transition: all var(--transition-base);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    border-color: #667eea;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 18px;
    min-height: 56px;
    font-size: 16px;
    border-radius: 14px;
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
  -webkit-tap-highlight-color: transparent;

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

  @media (max-width: 480px) {
    padding: 18px;
    min-height: 56px;
    font-size: 1.05rem;
    border-radius: 14px;
  }
`

function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { list, isLoading: listLoading, isNotFound } = useList(listId)
  const { items: fetchedItems, isLoading: itemsLoading, addItem, updateItem, toggleCheck, deleteItem, isAdding } = useItems(listId)
  const [items, setItems] = useState(fetchedItems)

  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showEditItemModal, setShowEditItemModal] = useState(false)
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false)
  
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('1')
  const [itemUnit, setItemUnit] = useState('un')
  const [itemCategory, setItemCategory] = useState('')
  const [itemPrice, setItemPrice] = useState<number | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  
  // Estados para orçamento com autosave
  const [budgetRaw, setBudgetRaw] = useState<string>('')
  const lastSavedBudgetRef = useRef<string>('')
  const isEditingBudgetRef = useRef(false)
  const [isBudgetOpen, setIsBudgetOpen] = useState(false)
  
  // Estados para preços dos itens com autosave (mapa de itemId -> rawValue)
  const [itemPricesRaw, setItemPricesRaw] = useState<Record<string, string>>({})
  const lastSavedPricesRef = useRef<Record<string, string>>({})
  
  const { user } = useAuth()

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

  useEffect(() => {
    setItems(fetchedItems)
  }, [fetchedItems])

  // Sincronizar budget da lista (BLOQUEADO durante edição)
  useEffect(() => {
    // NUNCA sobrescrever enquanto o usuário está editando
    if (isEditingBudgetRef.current) {
      return
    }

    if (list?.budget !== undefined) {
      const budgetValue = list.budget
      if (budgetValue !== null && !isNaN(budgetValue)) {
        const formatted = budgetValue.toFixed(2).replace('.', ',')
        // Só atualiza se for diferente do que já está salvo
        if (formatted !== lastSavedBudgetRef.current) {
          setBudgetRaw(formatted)
          lastSavedBudgetRef.current = formatted
        }
      } else {
        // Só limpa se não estiver editando e o valor salvo não for vazio
        if (lastSavedBudgetRef.current !== '') {
          setBudgetRaw('')
          lastSavedBudgetRef.current = ''
        }
      }
    }
  }, [list?.budget])

  // Função para salvar orçamento
  const handleSaveBudget = useCallback(async (rawValue: string) => {
    if (!listId || !user?.uid) return
    
    // Se o valor não mudou, não salva
    if (rawValue === lastSavedBudgetRef.current) {
      return
    }

    const numValue = parseBRMoneyToNumber(rawValue)
    
    try {
      await updateBudget(user.uid, listId, numValue)
      lastSavedBudgetRef.current = rawValue
    } catch (error: any) {
      console.error('Erro ao salvar orçamento:', error)
      toast.error('Erro ao salvar orçamento')
    }
  }, [listId, user?.uid])

  // Autosave do orçamento com debounce de 2s
  useDebouncedAutosave(budgetRaw, handleSaveBudget, 2000, !!listId && !!user?.uid)

  // Função para salvar preço de item
  const handleSaveItemPrice = useCallback(async (itemId: string, rawValue: string) => {
    if (!listId || !user?.uid) return
    
    // Se o valor não mudou, não salva
    if (rawValue === lastSavedPricesRef.current[itemId]) {
      return
    }

    const numValue = parseBRMoneyToNumber(rawValue)
    
    try {
      await updateItem({
        id: itemId,
        updates: { price: numValue },
      })
      lastSavedPricesRef.current[itemId] = rawValue
    } catch (error: any) {
      console.error('Erro ao salvar preço:', error)
      toast.error('Erro ao salvar preço')
    }
  }, [listId, user?.uid, updateItem])

  // Autosave dos preços dos itens (cada item tem seu próprio debounce)
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    
    Object.entries(itemPricesRaw).forEach(([itemId, rawValue]) => {
      const timeoutId = setTimeout(() => {
        handleSaveItemPrice(itemId, rawValue)
      }, 2000)
      timeouts.push(timeoutId)
    })

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [itemPricesRaw, handleSaveItemPrice])

  const toggleItem = async (id: string) => {
    console.log('✅ toggleItem CHAMADO', id)
    const current = items.find(item => item.id === id)
    if (!current) {
      console.log('❌ toggleItem CANCELADO - item não encontrado')
      return
    }
    console.log('✅ toggleItem - alternando checked:', id, !current.checked)

    // UI instantanea
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )

    // Persistencia assincrona sem bloquear UI
    try {
      await toggleCheck({ id, checked: !current.checked })
    } catch (error) {
      console.error('Erro ao alternar item:', error)
      // Reverte se falhar no backend
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, checked: current.checked } : item
        )
      )
    }
  }

  // Redirecionar se não tiver listId
  if (!listId) {
    toast.error('Selecione uma lista')
    navigate('/lists')
    return null
  }

  const handleAddItem = async () => {
    console.log('✅ handleAddItem CHAMADO', { itemName, itemQty, itemUnit, itemCategory, itemPrice })
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
        price: itemPrice,
      })
      setItemName('')
      setItemQty('1')
      setItemUnit('un')
      setItemCategory('')
      setItemPrice(null)
      setShowAddItemModal(false)
      toast.success('Item adicionado!')
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error)
      toast.error(error.message || 'Erro ao adicionar item')
    }
  }

  const handleEditItem = (item: any) => {
    console.log('✅ handleEditItem CHAMADO', item.id, item.name)
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemQty(item.qty?.toString() || '1')
    setItemUnit(item.unit || 'un')
    setItemCategory(item.category || '')
    setItemPrice(item.price !== null && item.price !== undefined ? item.price : null)
    setShowEditItemModal(true)
  }

  const handleSaveEditItem = async () => {
    console.log('✅ handleSaveEditItem CHAMADO', editingItemId, itemName)
    if (!editingItemId || !itemName.trim() || !listId) {
      console.log('❌ handleSaveEditItem CANCELADO - dados inválidos')
      return
    }

    const previousItems = items
    const parsedQty = itemQty ? parseInt(itemQty) : undefined
    const optimisticName = itemName.trim()
    const optimisticUnit = itemUnit || undefined
    const optimisticCategory = itemCategory || undefined
    const optimisticPrice = itemPrice

    setItems(prev =>
      prev.map(item =>
        item.id === editingItemId
          ? {
              ...item,
              name: optimisticName,
              qty: parsedQty ?? item.qty,
              unit: optimisticUnit,
              category: optimisticCategory,
              price: optimisticPrice,
            }
          : item
      )
    )
    console.log('edit', editingItemId, { name: optimisticName, qty: parsedQty, unit: optimisticUnit, category: optimisticCategory, price: optimisticPrice })

    try {
      await updateItem({
        id: editingItemId,
        updates: {
          name: optimisticName,
          qty: parsedQty,
          unit: optimisticUnit,
          category: optimisticCategory,
          price: optimisticPrice,
        },
      })
      setShowEditItemModal(false)
      setEditingItemId(null)
      setItemName('')
      setItemQty('1')
      setItemUnit('un')
      setItemCategory('')
      setItemPrice(null)
      toast.success('Item atualizado!')
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error)
      setItems(previousItems)
      toast.error(error.message || 'Erro ao atualizar item')
    }
  }

  const handleDeleteItem = async () => {
    console.log('✅ handleDeleteItem CHAMADO', editingItemId)
    if (!editingItemId || !listId) {
      console.log('❌ handleDeleteItem CANCELADO - sem ID')
      return
    }

    const currentId = editingItemId
    const previousItems = items
    setItems(prev => prev.filter(item => item.id !== currentId))
    console.log('✅ Item removido da UI (optimistic)', currentId)

    try {
      await deleteItem(currentId)
      setShowDeleteItemConfirm(false)
      setEditingItemId(null)
      toast.success('Item removido!')
    } catch (error: any) {
      console.error('Erro ao remover item:', error)
      setItems(previousItems)
      toast.error(error.message || 'Erro ao remover item')
    }
  }

  const totalItems = items.length
  const checkedItems = items.filter(item => item.checked).length
  const uncheckedItems = totalItems - checkedItems

  // Função para calcular o total dos preços usando reduce
  const calculateTotal = (): number => {
    return items.reduce((acc, item) => {
      const price = item.price
      if (price !== null && price !== undefined && !isNaN(price) && price > 0) {
        return acc + price
      }
      return acc
    }, 0)
  }

  const totalPrice = calculateTotal()
  const budgetValue = list?.budget ?? null
  const remaining = budgetValue !== null && !isNaN(budgetValue) ? budgetValue - totalPrice : null
  const isExceeded = remaining !== null && remaining < 0

  if (listLoading || itemsLoading) {
    return <LoadingSpinner />
  }

  if (isNotFound || (!listLoading && !list && listId)) {
    return (
      <Container>
        <ErrorState>
          <ErrorTitle>Lista não encontrada</ErrorTitle>
          <p>A lista que você está procurando não existe ou foi removida.</p>
          <Button 
            type="button"
            $variant="primary" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Voltar para listas (erro)')
              navigate('/lists')
            }} 
            style={{ marginTop: '20px' }}
          >
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
          <Button 
            type="button"
            $variant="primary" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Voltar para listas (erro)')
              navigate('/lists')
            }} 
            style={{ marginTop: '20px' }}
          >
            Voltar para listas
          </Button>
        </ErrorState>
      </Container>
    )
  }

  return (
    <>
      <Container>
        <ListHeader
          listId={listId}
          name={list.name}
          onBack={() => navigate('/lists')}
        />

        <Content hasFooter={totalItems > 0}>
          <AddButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ AddButton CLICADO')
              setShowAddItemModal(true)
            }} 
            disabled={isAdding}
          >
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

          {/* Seção de Orçamento Colapsável */}
          {(totalItems > 0 || budgetRaw || budgetValue !== null) && (
            <BudgetCard>
              <BudgetHeader
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsBudgetOpen(prev => !prev)
                }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
              >
                <BudgetHeaderLeft>
                  <BudgetHeaderText>
                    📊 Orçamento da compra
                  </BudgetHeaderText>
                  {!isBudgetOpen && totalItems > 0 && (
                    <BudgetMini>
                      Total: {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      {budgetValue !== null && remaining !== null && (
                        <> • Restante: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</>
                      )}
                    </BudgetMini>
                  )}
                </BudgetHeaderLeft>
                <BudgetToggleIcon $isOpen={isBudgetOpen}>
                  ⌄
                </BudgetToggleIcon>
              </BudgetHeader>
              <BudgetContent $isOpen={isBudgetOpen}>
                <TotalContent>
                  {budgetValue !== null && !isNaN(budgetValue) && (
                    <TotalRow>
                      <TotalLabel>🧮 Orçamento:</TotalLabel>
                      <TotalValue>
                        {budgetValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TotalValue>
                    </TotalRow>
                  )}
                  <TotalRow>
                    <TotalLabel>💰 Total da compra:</TotalLabel>
                    <TotalValue $isExceeded={isExceeded}>
                      {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TotalValue>
                  </TotalRow>
                  {budgetValue !== null && remaining !== null && (
                    <TotalRow>
                      <TotalLabel>💸 Restante:</TotalLabel>
                      <RemainingValue $isExceeded={isExceeded}>
                        {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        {isExceeded && ' ⚠️ Orçamento excedido'}
                      </RemainingValue>
                    </TotalRow>
                  )}
                  <TotalRow style={{ marginTop: '12px' }}>
                    <BudgetInput
                      value={list?.budget ?? null}
                      onChange={() => {
                        // onChange será chamado no onBlur, mas o autosave usa rawValue
                      }}
                      onRawChange={(rawValue) => {
                        setBudgetRaw(rawValue)
                      }}
                      onEditingChange={(isEditing) => {
                        isEditingBudgetRef.current = isEditing
                      }}
                      placeholder={budgetValue !== null ? "Editar orçamento" : "Quanto você tem para gastar? (opcional)"}
                    />
                  </TotalRow>
                </TotalContent>
              </BudgetContent>
            </BudgetCard>
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
                    onChange={(e) => {
                      e.stopPropagation()
                      console.log('✅ Checkbox CLICADO (mobile)', item.id, !item.checked)
                      toggleItem(item.id)
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                    }}
                    aria-label={item.checked ? `Desmarcar ${item.name}` : `Marcar ${item.name} como concluído`}
                    style={{ 
                      gridColumn: '1', 
                      gridRow: '1',
                      alignSelf: 'start',
                      marginTop: '2px'
                    }}
                  />
                  <ItemContent>
                    <ItemTopRow>
                      <ItemName
                        checked={item.checked}
                        style={{ textDecoration: item.checked ? 'line-through' : 'none' }}
                      >
                        {item.name}
                      </ItemName>
                    </ItemTopRow>
                    <ItemBottomRow>
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
                      <PriceInput
                        value={item.price}
                        onChange={(price) => {
                          // Atualização imediata na UI
                          setItems(prev =>
                            prev.map(i =>
                              i.id === item.id ? { ...i, price } : i
                            )
                          )
                          // Autosave será feito pelo debounce
                        }}
                        onRawChange={(rawValue) => {
                          // Atualiza o estado raw para o debounce
                          setItemPricesRaw(prev => ({
                            ...prev,
                            [item.id]: rawValue,
                          }))
                        }}
                        placeholder="0,00"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      />
                    </ItemBottomRow>
                  </ItemContent>
                  <ItemActions>
                    <ActionButton 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('✅ Editar Item CLICADO', item.id)
                        handleEditItem(item)
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      aria-label={`Editar item ${item.name}`}
                      title="Editar"
                    >
                      ✏️
                    </ActionButton>
                    <ActionButton
                      type="button"
                      className="danger"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('✅ Deletar Item CLICADO', item.id)
                        setEditingItemId(item.id)
                        setShowDeleteItemConfirm(true)
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      aria-label={`Remover item ${item.name}`}
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

        {/* Footer fixo simplificado com Total */}
        {totalItems > 0 && (
          <TotalFooter>
            <TotalRow style={{ margin: 0 }}>
              <TotalLabel style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                💰 Total:
              </TotalLabel>
              <TotalValue $isExceeded={isExceeded} style={{ fontSize: '1.3rem' }}>
                {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TotalValue>
            </TotalRow>
          </TotalFooter>
        )}
      </Container>

      {/* Modal Adicionar Item */}
      <Overlay $show={showAddItemModal} onClick={() => setShowAddItemModal(false)} />
      <BottomSheet $show={showAddItemModal} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Adicionar Item</ModalTitle>
          <CloseButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Fechar Modal Adicionar')
              setShowAddItemModal(false)
              setItemName('')
              setItemQty('1')
              setItemUnit('un')
              setItemCategory('')
              setItemPrice(null)
            }}
          >✕</CloseButton>
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

        <FormGroup>
          <Label>Preço (opcional)</Label>
          <PriceInput
            value={itemPrice}
            onChange={(price) => setItemPrice(price)}
            placeholder="Ex: 12,50"
          />
        </FormGroup>

        <ModalActions>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Cancelar Adicionar Item')
              setShowAddItemModal(false)
              setItemName('')
              setItemQty('1')
              setItemUnit('un')
              setItemCategory('')
              setItemPrice(null)
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
              console.log('✅ Adicionar Item CLICADO')
              handleAddItem()
            }} 
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
          <CloseButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Fechar Modal Editar Item')
              setShowEditItemModal(false)
              setEditingItemId(null)
              setItemName('')
              setItemQty('1')
              setItemUnit('un')
              setItemCategory('')
              setItemPrice(null)
            }}
          >✕</CloseButton>
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

        <FormGroup>
          <Label>Preço (opcional)</Label>
          <PriceInput
            value={itemPrice}
            onChange={(price) => setItemPrice(price)}
            placeholder="Ex: 12,50"
          />
        </FormGroup>

        <ModalActions>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Cancelar Editar Item')
              setShowEditItemModal(false)
              setEditingItemId(null)
              setItemName('')
              setItemQty('1')
              setItemUnit('un')
              setItemCategory('')
              setItemPrice(null)
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
              console.log('✅ Salvar Item CLICADO')
              handleSaveEditItem()
            }} 
            disabled={!itemName.trim()}
          >
            Salvar
          </Button>
        </ModalActions>
      </BottomSheet>

      {/* Modal Confirmar Deletar Item */}
      <Overlay $show={showDeleteItemConfirm} onClick={() => setShowDeleteItemConfirm(false)} />
      <BottomSheet $show={showDeleteItemConfirm} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <CloseButton 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Fechar Modal Deletar Item')
              setShowDeleteItemConfirm(false)
              setEditingItemId(null)
            }}
          >✕</CloseButton>
        </ModalHeader>
        
        <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
          Tem certeza que deseja remover este item?
        </p>

        <ModalActions>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Cancelar Deletar Item')
              setShowDeleteItemConfirm(false)
              setEditingItemId(null)
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
              console.log('✅ Confirmar Deletar Item CLICADO')
              handleDeleteItem()
            }}
          >
            Deletar
          </Button>
        </ModalActions>
      </BottomSheet>
    </>
  )
}

export default ListDetailPage
