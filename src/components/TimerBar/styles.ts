import styled from 'styled-components'

import { getTimerColor } from '../OtpCodeField/utils'

interface FillProps {
  $progress: number
  $expiring: boolean
  $noTransition: boolean
}

interface TimerProps {
  $expiring: boolean
}

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 0;
`

export const Track = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.grey100.mode1}33;
  overflow: hidden;
`

export const Fill = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !['$progress', '$expiring', '$noTransition'].includes(prop)
})<FillProps>`
  height: 100%;
  border-radius: 2px;
  background: ${({ theme, $expiring }) => getTimerColor(theme, $expiring)};
  width: ${({ $progress }) => $progress}%;
  transition: ${({ $noTransition }) =>
    $noTransition ? 'none' : 'width 1s linear'};
`

export const Timer = styled.span.withConfig({
  shouldForwardProp: (prop) => !['$expiring'].includes(prop)
})<TimerProps>`
  font-family: 'Inter';
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme, $expiring }) => getTimerColor(theme, $expiring)};
  min-width: 22px;
  text-align: right;
`
