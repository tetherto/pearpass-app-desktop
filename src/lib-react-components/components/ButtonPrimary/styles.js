import styled from 'styled-components'

export const Button = styled.button`
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.primary400.mode1};
  color: ${({ theme }) => theme.colors.black.mode1};
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm':
        return '12px'
      case 'lg':
        return '16px'
      default:
        return '14px'
    }
  }};
  font-family: 'Inter';
  font-weight: 600;
  line-height: 17px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary300.mode1};
  }

  &:active {
    background: ${({ theme }) => theme.colors.primary500.mode1};
  }
`
