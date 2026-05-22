import styled from 'styled-components'

export const NoticeTextWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
`

export const NoticeTextComponent = styled.div`
  color: ${({ type }) => {
    switch (type) {
      case 'success':
        return '#BADE5B'
      case 'error':
        return '#D65C5E'
      case 'warning':
        return '#FFAE00'
      default:
        return '#F6F6F6'
    }
  }};
  font-family: 'Inter';
  font-size: 8px;
  font-weight: 500;
`
