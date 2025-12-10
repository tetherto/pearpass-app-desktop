import { PASSWORD_STRENGTH } from 'pearpass-utils-password-check'
import styled from 'styled-components'

export const PasswordStrongnessWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isStrong'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme, strength }) => {
    switch (strength) {
      case PASSWORD_STRENGTH.SAFE:
        return theme.colors.primary400.mode1
      case PASSWORD_STRENGTH.VULNERABLE:
        return theme.colors.errorRed.dark
      case PASSWORD_STRENGTH.WEAK:
        return theme.colors.errorYellow.mode1
      default:
        return theme.colors.white.mode1
    }
  }};
  font-family: 'Inter';
  font-size: 8px;
  font-weight: 500;
`
