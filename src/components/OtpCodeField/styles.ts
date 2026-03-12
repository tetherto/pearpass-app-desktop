import styled from 'styled-components'

import { colors } from 'pearpass-lib-ui-theme-provider'

export const NextCodeButton = styled.button<{ disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid ${colors.grey100.mode1};
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  background: transparent;
  color: ${colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;
  outline: none;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    border-color: ${colors.primary400.mode1};
  }

  &:active,
  &:focus,
  &:focus-visible {
    border-color: ${colors.grey100.mode1};
    outline: none;
  }

  &:hover:active:not(:disabled) {
    border-color: ${colors.primary400.mode1};
  }
`
