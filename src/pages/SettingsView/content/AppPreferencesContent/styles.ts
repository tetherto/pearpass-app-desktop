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

  sectionHeading: {
    marginTop: `${rawTokens.spacing16}px`,
    marginBottom: `${rawTokens.spacing4}px`
  },

  settingCard: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    padding: `${rawTokens.spacing12}px`,
    borderRadius: `${rawTokens.radius8}px`,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    boxSizing: 'border-box' as const
  },

  row: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: `${rawTokens.spacing16}px`,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  rowDivider: {
    borderTopWidth: 1,
    borderTopStyle: 'solid' as const,
    borderTopColor: colors.colorBorderPrimary,
    marginTop: `${rawTokens.spacing12}px`,
    paddingTop: `${rawTokens.spacing12}px`
  },

  toggleColumn: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing4}px`,
    flex: 1,
    minWidth: 0
  }
})
