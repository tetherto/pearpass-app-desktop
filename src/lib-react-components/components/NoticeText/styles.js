import styled from 'styled-components'

export const NoticeTextWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
`

export const NoticeTextComponent = styled.div`
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success':
        return theme.colors.primary400.mode1
      case 'error':
        return theme.colors.errorRed.dark
      case 'warning':
        return theme.colors.errorYellow.mode1
      default:
        return theme.colors.white.mode1
    }
  }};
  font-family: 'Inter';
  font-size: 8px;
  font-weight: 500;
`
