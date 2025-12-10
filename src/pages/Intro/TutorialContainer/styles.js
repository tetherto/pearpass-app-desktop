import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  width: 100%;
  gap: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const Header = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Humble Nostalgia';
  font-size: 5.3vw;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const DescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 2.6vw;
  font-style: normal;
  font-weight: 200;
  line-height: normal;
  max-width: 730px;
`

export const ImageContainer = styled.div`
  width: 40vw;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
`
