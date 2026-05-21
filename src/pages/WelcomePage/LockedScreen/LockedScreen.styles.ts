import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    width: '100%',
    minHeight: '100%',
    boxSizing: 'border-box' as const
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 0,
    maxWidth: '520px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: `${rawTokens.spacing16}px ${rawTokens.spacing24}px`,
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const
  },

  pageHeaderWrap: {
    marginBottom: `${rawTokens.spacing6}px`,
    width: '100%'
  },

  description: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing4}px`,
    maxWidth: '420px'
  },

  descriptionText: {
    fontSize: `${rawTokens.fontSize14}px`,
    fontWeight: rawTokens.weightRegular,
    color: colors.colorTextSecondary,
    margin: 0
  },

  pill: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '440px',
    marginTop: `${rawTokens.spacing24}px`,
    padding: `${rawTokens.spacing10}px ${rawTokens.spacing8}px`,
    borderRadius: `${rawTokens.spacing10}px`,
    border: `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const
  },

  pillText: {
    fontSize: `${rawTokens.fontSize14}px`,
    fontWeight: rawTokens.weightMedium,
    color: colors.colorTextSecondary
  },

  pillLeft: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: `${rawTokens.spacing8}px`,
    minWidth: 0
  },

  countdown: {
    color: colors.colorPrimary,
    fontVariantNumeric: 'tabular-nums' as const,
    fontSize: `${rawTokens.fontSize14}px`,
    fontWeight: rawTokens.weightMedium,
    flexShrink: 0 as const
  }
})
