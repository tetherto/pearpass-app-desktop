import styled from 'styled-components'

import { TIMER_URGENCY } from './constants'

interface TimerProps {
  $urgency: string
}

export const TimerWrapper = styled.div<TimerProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme, $urgency }) => {
    if ($urgency === TIMER_URGENCY.CRITICAL) return theme.colors.errorRed.mode1
    if ($urgency === TIMER_URGENCY.WARNING)
      return theme.colors.errorYellow.mode1
    return theme.colors.primary400.mode1
  }};
  min-width: 28px;
  justify-content: center;
`

export const NextCodeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
