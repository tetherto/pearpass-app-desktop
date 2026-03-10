import styled from 'styled-components'

import { getUrgencyColor } from '../OtpCodeField/constants'

export const Wrapper = styled.div`
  width: 14px;
  height: 14px;
  position: relative;
  flex-shrink: 0;
`

export const Svg = styled.svg`
  width: 14px;
  height: 14px;
  transform: rotate(-90deg);
`

export const CircleBg = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.colors.grey100.mode1}33;
  stroke-width: 1.5;
`

export const CircleFill = styled.circle.withConfig({
  shouldForwardProp: (prop) =>
    !['$urgency', '$dashOffset', '$noTransition'].includes(prop)
})`
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  transition: ${({ $noTransition }) =>
    $noTransition ? 'none' : 'stroke-dashoffset 1s linear'};
  stroke: ${({ theme, $urgency }) => getUrgencyColor(theme, $urgency)};
  stroke-dasharray: 34.558;
  stroke-dashoffset: ${({ $dashOffset }) => $dashOffset};
`
