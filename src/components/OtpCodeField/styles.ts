import { colors } from 'pearpass-lib-ui-theme-provider'

export const styles = {
  nextCodeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    border: `1px solid ${colors.grey100.mode1}`,
    borderRadius: 6,
    cursor: 'pointer',
    background: 'transparent',
    color: colors.white.mode1,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 500
  },
  nextCodeButtonHover: {
    borderColor: colors.primary400.mode1
  },
  nextCodeButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}
