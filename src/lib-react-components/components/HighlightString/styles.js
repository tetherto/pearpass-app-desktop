import styled from 'styled-components'

export const HighlightedText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  span {
    white-space: pre-wrap;
  }
`

export const NumberSpan = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-weight: bold;
`

export const SymbolSpan = styled.span`
  color: ${({ theme }) => theme.colors.categoryLogin.mode1};
  font-weight: bold;
`
