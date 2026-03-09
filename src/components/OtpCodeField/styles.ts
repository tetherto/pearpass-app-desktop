import styled, { DefaultTheme } from 'styled-components'

import { TIMER_URGENCY } from './constants'

interface TimerProps {
  $urgency: string
}

const getUrgencyColor = (theme: DefaultTheme, $urgency: string) => {
  if ($urgency === TIMER_URGENCY.CRITICAL) return theme.colors.errorRed.mode1
  if ($urgency === TIMER_URGENCY.WARNING) return theme.colors.errorYellow.mode1
  return theme.colors.primary400.mode1
}

export const TimerWrapper = styled.div<TimerProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme, $urgency }) => getUrgencyColor(theme, $urgency)};
  min-width: 28px;
  justify-content: center;
`

export const OtpFieldContainer = styled.div`
  /* Restore border/radius on OutlineInputWrapper when progress bar follows */
  & > div:first-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  }
`

export const ProgressBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 0;
`

export const ProgressBarTrack = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.grey100.mode1}33;
  overflow: hidden;
`

interface ProgressBarFillProps {
  $progress: number
  $urgency: string
  $noTransition?: boolean
}

export const ProgressBarFill = styled.div<ProgressBarFillProps>`
  height: 100%;
  border-radius: 2px;
  background: ${({ theme, $urgency }) => getUrgencyColor(theme, $urgency)};
  width: ${({ $progress }) => $progress}%;
  transition: ${({ $noTransition }) =>
    $noTransition ? 'none' : 'width 1s linear'};
`

export const ProgressBarTimer = styled.span<TimerProps>`
  font-family: 'Inter';
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme, $urgency }) => getUrgencyColor(theme, $urgency)};
  min-width: 22px;
  text-align: right;
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
  color: ${({ theme }) => theme.colors.white.mode1};
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
