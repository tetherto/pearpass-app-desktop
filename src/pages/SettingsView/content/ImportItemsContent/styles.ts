import { rawTokens, ThemeColors } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing24}px`
  },

  header: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing6}px`
  },

  listWrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing4}px`
  },

  listItems: {
    border: `1px solid ${colors.colorSurfaceDisabled}`,
    borderRadius: `${rawTokens.spacing8}px`
  },

  listItemBorder: {
    borderBottom: `1px solid ${colors.colorSurfaceDisabled}`
  },

  uploadArea: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`
  },

  passwordSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`
  },

  footer: {
    display: 'flex' as const,
    justifyContent: 'flex-end' as const
  },

  backButton: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer' as const
  }
})
