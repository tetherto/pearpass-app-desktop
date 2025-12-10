import styled, { keyframes } from 'styled-components'

export const BlackBackground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  height: 100%;
  background-color: ${({ theme, pageIndex }) =>
    pageIndex === 0 || pageIndex === 5 ? '#010702' : theme.colors.black.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};
  padding: 100px;
  overflow: hidden;
`

export const GradientBackground = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const LogoContainer = styled.div`
  display: flex;
  gap: 15px;
  flex: 0 0 1;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  z-index: 1;
`

export const PearPass = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Humble Nostalgia';
  font-size: 68px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  height: 55px;
`

export const WelcomeText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Humble Nostalgia';
  font-size: 4vw;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const StrongText = styled.span`
  font-weight: 400;
`

const levitateBounce = keyframes`
0%,100% {
  transform:  translateY(0px);
}
50% {
  transform: translateY(30px);
}
`

export const pear3dLockImage = styled.img`
  animation: ${levitateBounce} 2.5s ease-in-out infinite;
`
export const LastPageContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 20px;
`

export const LastPageDescription = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Humble Nostalgia';
  font-size: 48px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const Video = styled.video`
  width: 30vw;
  max-width: 100%;
  height: auto;
  object-fit: cover;
`

export const SkipContainer = styled.div`
  position: absolute;
  top: 84px;
  right: 106px;
`

export const BottomGradient = styled.div`
  position: absolute;
  transform: translate(-50%, 50%);
  left: 100px;
  bottom: 220px;
  width: 745px;
  height: 745px;
  flex-shrink: 0;

  border-radius: 50%;
  opacity: 0.2;
  background: ${({ theme }) => theme.colors.primary400.mode1};
  filter: blur(275px);
`

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

export const ButtonContainer = styled.div.attrs(({ className }) => ({
  className
}))`
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  opacity: 0;

  &.fade-in {
    animation: ${fadeIn} 2.5s forwards;
  }
`

export const ProgressContainer = styled.div`
  display: flex;
  gap: 4px;
  width: 183px;
  align-items: center;
  justify-content: center;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`

export const ProgressItem = styled.div`
  cursor: pointer;
  height: 8px;
  flex: 1 0 0;

  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.primary400.mode1 : 'transparent'};

  border-radius: 15px;
  border: 1px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.colors.primary400.mode1 : theme.colors.grey100.mode1};

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
`

export const LogoImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  animation: ${levitateBounce} 4s ease-in-out infinite;
`
