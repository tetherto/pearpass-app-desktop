import styled from 'styled-components'

export const content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const Description = styled.span`
  font-size: 12px;
  font-weight: 400;
  font-family: 'Inter';
  color: ${({ theme }) => theme.colors.white.mode1};
`
