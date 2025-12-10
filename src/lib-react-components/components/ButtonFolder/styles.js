import styled from 'styled-components'

export const Button = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
  background: 'transparent';
  color: ${({ theme }) => theme.colors.white.mode1};
  border: 1px solid ${({ theme }) => theme.colors.primary400.mode1};

  & svg path {
    fill: ${({ theme }) => theme.colors.white.mode1};
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary300.mode1};
    background: ${({ theme }) => theme.colors.primary300.mode1};
    color: ${({ theme }) => theme.colors.black.mode1};

    & svg path {
      fill: ${({ theme }) => theme.colors.black.mode1};
    }
  }

  &:active {
    border: 1px solid ${({ theme }) => theme.colors.primary400.mode1};
    background: ${({ theme }) => theme.colors.primary400.mode1};
    color: ${({ theme }) => theme.colors.black.mode1};

    & svg path {
      fill: ${({ theme }) => theme.colors.black.mode1};
    }
  }
`
