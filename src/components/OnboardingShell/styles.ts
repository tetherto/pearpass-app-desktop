import styled from 'styled-components'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

interface SolidBackgroundProps {
  $backgroundColor: string
}

export const ShellViewport = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  overflow: hidden;

  & > * {
    flex: 1 1 auto;
    min-height: 0;
  }
`

export const SolidBackground = styled.div<SolidBackgroundProps>`
  width: 100%;
  height: 100%;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`

export const Stage = styled.div`
  width: 100%;
  height: 100%;
`

export const Panel = styled.div<{ $isSolid?: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  box-shadow: ${({ $isSolid }) =>
    $isSolid
      ? 'none'
      : `inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 20px 60px rgba(0, 0, 0, 0.28)`};

  &::after {
    content: '';
    display: ${({ $isSolid }) => ($isSolid ? 'none' : 'block')};
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0) 18%
    );
  }
`

export const ContentWrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 27px 32px;
  text-align: center;

  @media (max-height: 820px) {
    padding: 27px ${rawTokens.spacing24}px;
  }

  @media (max-width: 1100px) {
    padding: 27px ${rawTokens.spacing24}px;
  }
`

export const SharedVideo = styled.video`
  width: 282px;
  height: 282px;
  flex: 0 0 auto;
  object-fit: contain;
  z-index: 10;
  mix-blend-mode: screen;
  background: transparent;
  isolation: isolate;
  filter: saturate(1.05) brightness(1.02);
`
