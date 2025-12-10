import styled from 'styled-components'

export const Background = styled.div`
  position: relative;
  background-color: ${({ theme, isAuthScreen }) =>
    isAuthScreen ? theme.colors.grey500.mode1 : theme.colors.black.mode1};
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export const LogoContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 10;
  text-align: start;
  height: 55px;
  width: 311px;
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

export const PageContent = styled.div`
  position: relative;
  color: white;
  width: 100%;
  height: 100%;
  padding-top: 42px;
  padding: 42px 110px 0 110px;
  display: flex;
  flex-direction: column;
  align-items: ${({ isAuthScreen }) =>
    isAuthScreen ? 'center' : 'flex-start'};
`

export const ContentWrapper = styled.div`
  flex: 1;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const LeftSpotlightWrapper = styled.div`
  display: ${({ isAuthScreen }) => (isAuthScreen ? 'none' : 'block')};

  position: absolute;
  left: -5%;
  bottom: 0;

  width: 25%;
  height: 100%;
  flex-shrink: 0;

  border-radius: 1194.565px;
  opacity: 0.3;
  background: #b0d944;
  filter: blur(250px);
`

export const MiddleSmallSpotlightWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`

export const RightSpotlightWrapper = styled.div`
  width: 40%;
  height: 40%;
  position: absolute;
  right: 0;
`

export const BottomGradient = styled.div`
  display: ${({ isAuthScreen }) => (isAuthScreen ? 'block' : 'none')};

  z-index: 1;
  transform: translate(-50%, 95%);
  opacity: 0.7;
  bottom: 0;
  left: 50%;
  width: 85%;
  height: 25%;
  position: absolute;
  border-radius: 100%;
  background: #b0d944;
  filter: blur(90px);
`
