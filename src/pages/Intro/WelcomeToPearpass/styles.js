import styled, { keyframes } from 'styled-components'

export const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  gap: 80px;
  align-items: center;
  justify-content: space-between;
`

export const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`

export const LeftText = styled.div.attrs(({ className }) => ({
  className
}))`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
`

export const LeftDescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 2.6vw;
  font-style: normal;
  font-weight: 200;
  line-height: normal;
  max-width: 730px;
`

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

export const DescriptionText = styled.span.attrs(({ className }) => ({
  className
}))`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Humble Nostalgia';
  font-size: 4vw;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  &.fade-out {
    animation: ${fadeOut} 2.5s forwards;
    animation-delay: 2.5s;
  }
`

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.8s ease-in;
`

const levitateBounce = keyframes`
0%,100% {
  transform:  translateY(0px);
}
50% {
  transform: translateY(30px);
}
`
export const Video = styled.video.attrs(({ className }) => ({
  className
}))`
  width: 75%;
  aspect-ratio: 1/1;
  height: auto;
  object-fit: cover;

  &.animate {
    animation: ${levitateBounce} 4s ease-in-out infinite 2.8s;
    animation-fill-mode: forwards;
  }
`
