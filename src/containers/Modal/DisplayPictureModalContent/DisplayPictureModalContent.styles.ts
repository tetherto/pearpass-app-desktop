import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  body: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '100%',
    borderRadius: `${rawTokens.radius8}px`,
    overflow: 'hidden' as const
  },
  image: {
    maxWidth: '100%',
    maxHeight: '600px',
    objectFit: 'contain' as const,
    borderRadius: `${rawTokens.radius8}px`
  }
})
