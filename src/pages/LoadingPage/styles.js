import styled from 'styled-components'

export const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #232323 0%, #050b06 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`

export const PearImageBlurred = styled.img`
  position: absolute;
  width: 480px;
  height: 480px;
  top: 1%;
  left: calc(50% - 240px - 113px);
  filter: blur(2px);
  object-fit: cover;
  z-index: 1;
`

export const PearImage = styled.img`
  position: absolute;
  width: 524px;
  height: 524px;
  top: 8%;
  left: calc(50% - 262px);
  object-fit: cover;
  z-index: 2;
`

export const ContentContainer = styled.div`
  position: absolute;
  top: 64%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
`

export const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

export const WelcomeTitle = styled.h1`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
  line-height: 1.21;
  text-align: center;
`

export const WelcomeSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 700;
  line-height: 1.21;
  text-align: center;
  max-width: 450px;
`

export const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: min(650px, 90%);
`

export const ProgressBarBackground = styled.div`
  width: 100%;
  height: 12px;
  background-color: #393939;
  border-radius: 15px;
  overflow: hidden;
`

export const ProgressBarFill = styled.div`
  height: 11px;
  background-color: ${({ theme }) => theme.colors.primary400.mode1};
  border-radius: 15px;
  width: ${({ progress }) => `${progress}%`};
  transition: width 0.1s ease-out;
`

export const LoadingTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`

export const LoadingText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
  line-height: 1.21;
`

export const FooterContainer = styled.div`
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 10;
`

export const PoweredByText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
  line-height: 1.21;
`

export const BottomGlow = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  width: 100%;
  max-width: 1428px;
  height: 400px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary400.mode1};
  filter: blur(320px);
  z-index: 0;
`
