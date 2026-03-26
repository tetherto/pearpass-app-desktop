import styled from 'styled-components'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

interface ProgressTrackProps {
  $trackColor: string
}

interface ProgressFillProps {
  $fillColor: string
  $progress: number
}

export const MainContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 736px);
  flex-direction: column;
  align-items: center;
  gap: ${rawTokens.spacing24}px;
`

export const ArtFrame = styled.div`
  display: flex;
  width: 282px;
  height: 282px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
`

export const TextBlock = styled.div`
  display: flex;
  width: min(100%, 468px);
  flex-direction: column;
  align-items: stretch;
  gap: ${rawTokens.spacing6}px;
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

export const ProgressSection = styled.div`
  display: flex;
  width: min(100%, 500px);
  flex-direction: column;
  margin-top: 8px;
  gap: 0;
`

export const ProgressTrack = styled.div<ProgressTrackProps>`
  width: 100%;
  height: 12px;
  overflow: hidden;
  border-radius: ${rawTokens.radius20}px;
  background-color: ${({ $trackColor }) => $trackColor};
`

export const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  border-radius: ${rawTokens.radius20}px;
  background-color: ${({ $fillColor }) => $fillColor};
  transition: width 0.1s ease-out;
`
