import styled from 'styled-components'

export const PageContainer = styled.div`
  width: 100%;
  height: 100%;
`

export const PearHand = styled.img`
  position: relative;
  width: 50%;
  max-width: 585px;
  aspect-ratio: 1/1;
`

export const PageContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 120px;
`

export const Title = styled.span`
  flex: 1;
  color: ${({ theme }) => theme.colors.white.mode1};
  max-width: 700px;
  font-family: 'Humble Nostalgia';
  font-size: clamp(1rem, 8vw, 10rem);
  font-style: normal;
  font-weight: 400;
  line-height: 1.1;
`

export const GreenText = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
`
