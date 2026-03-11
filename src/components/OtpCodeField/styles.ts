import styled from 'styled-components'

export const NextCodeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
