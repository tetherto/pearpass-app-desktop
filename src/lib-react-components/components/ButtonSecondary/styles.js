import styled from 'styled-components'

export const Button = styled.button`
  background: transparent;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.white.mode1};
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.primary400.mode1};
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
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ theme }) => theme.colors.grey400.mode1};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary500.mode1};
  }

  &:active {
    background: ${({ theme }) => theme.colors.black.mode1};
  }
`
