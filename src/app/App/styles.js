import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'
import styled from 'styled-components'

export const AppWrapper = styled.div`
  height: 100%;
`

export const WindowBackground = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor || 'transparent'};
  display: flex;
  flex-direction: column;
`
export const ContentFrame = styled.div`
  position: relative;
  z-index: 0;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  margin: ${rawTokens.spacing8}px;
  border-radius: ${process.platform === 'darwin'
    ? `${rawTokens.radius8}px ${rawTokens.radius8}px ${rawTokens.radius20}px ${rawTokens.radius20}px`
    : `${rawTokens.radius8}px`};
  border: ${({ $borderColor }) => `1px solid ${$borderColor || 'transparent'}`};
  overflow: auto;
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor || 'transparent'};
`
