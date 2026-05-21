import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    gap: `${rawTokens.spacing24}px`,
    width: '100%',
    flex: 1,
    minHeight: 0,
    boxSizing: 'border-box' as const
  },

  intro: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`,
    maxWidth: 560
  },

  form: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0,
    gap: `${rawTokens.spacing24}px`
  },

  actions: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    flexShrink: 0
  }
})
