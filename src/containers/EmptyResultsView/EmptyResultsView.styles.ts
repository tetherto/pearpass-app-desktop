import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
    gap: `${rawTokens.spacing16}px`,
    paddingInline: `${rawTokens.spacing16}px`,
    paddingBlock: `${rawTokens.spacing24}px`,
    width: '100%'
  },

  text: {
    textAlign: 'center' as const
  }
})
