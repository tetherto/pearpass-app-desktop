import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing16}px`,
    width: '100%'
  },
  timerRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    width: '100%'
  },
  footer: {
    display: 'flex' as const,
    justifyContent: 'flex-end' as const,
    width: '100%'
  }
})
