import styled from 'styled-components'

export const ContentContainer = styled.div`
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

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: start;
  gap: 10px;
`
