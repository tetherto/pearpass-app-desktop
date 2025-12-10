import styled from 'styled-components'

export const Button = styled.button`
  display: inline-flex;
  width: 30px;
  height: 30px;
  padding: 4px;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.black.mode1};
  border-radius: 50%;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.black.mode1};
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`
