import styled from 'styled-components'

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const ButtonWrapper = styled.div`
  align-self: self-start;
`

export const Description = styled.span`
  font-size: 12px;
  font-weight: 400;
  font-family: 'Inter';
  color: ${({ theme }) => theme.colors.white.mode1};
`
