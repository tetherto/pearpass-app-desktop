import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.colorBorderPrimary,
    flexShrink: 0,
    border: 'none',
    padding: 0,
    margin: 0
  },
  bodyColumn: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    alignItems: 'stretch' as const
  },
  inputSection: {
    marginTop: rawTokens.spacing12,
    boxSizing: 'border-box' as const,
  },
  sectionLabel: {
    color: colors.colorTextSecondary,
    fontFamily: rawTokens.fontPrimary,
    fontSize: rawTokens.fontSize12,
    fontWeight: rawTokens.weightMedium,
    marginBottom: rawTokens.spacing8
  },
  pairingHint:{
    marginTop: rawTokens.spacing12,
  }
})
