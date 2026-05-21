import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    gap: `${rawTokens.spacing16}px`,
    width: '100%'
  },
  topContent: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`
  }
})
