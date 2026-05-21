import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    gap: `${rawTokens.spacing8}px`,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  settingCard: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    padding: `${rawTokens.spacing12}px`,
    borderRadius: `${rawTokens.radius8}px`,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    boxSizing: 'border-box' as const,
    marginTop: `${rawTokens.spacing16}px`
  },

  openLogsRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    width: '100%',
    marginTop: `${rawTokens.spacing16}px`,
    boxSizing: 'border-box' as const
  }
})
