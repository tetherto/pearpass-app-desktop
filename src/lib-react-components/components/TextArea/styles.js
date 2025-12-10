import styled from 'styled-components'

export const TextAreaComponent = styled.textarea`
  width: 100%;
  height: 233px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  background: ${({ theme }) => theme.colors.grey400.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};
  resize: none;

  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey100.mode1};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`
export const ReportTextAreaComponent = styled.textarea`
  width: 100%;
  height: 70px;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 600;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  background: ${({ theme }) => theme.colors.grey400.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};
  resize: none;

  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey300.mode1};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`
