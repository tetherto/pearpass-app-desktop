import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const BlurredBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;
  border-radius: 50%;
  opacity: 0.2;
  background: #b0d944;
  filter: ${({ blurSize }) =>
    blurSize === 'sm' ? 'blur(75px)' : 'blur(250px)'};
  z-index: 0;
`

export const ChildrenContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 1;
`
