import styled from 'styled-components'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const MainContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 736px);
  flex-direction: column;
  align-items: center;
  gap: ${rawTokens.spacing24}px;
`

export const RiveArtWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: min(100%, 260px);
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  overflow: hidden;
  isolation: isolate;
`

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${rawTokens.spacing6}px;
  width: min(100%, 468px);
  text-align: center;

  & > * {
    max-width: 100%;
  }
`

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

export const ContinueButtonWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(2px);
`

export const ButtonIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`