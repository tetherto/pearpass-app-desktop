import styled from 'styled-components'

export const HeaderWrapper = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
`

export const TextWrapper = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
  padding-top: 5px;
`

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 20px;
  gap: 15px;
`
