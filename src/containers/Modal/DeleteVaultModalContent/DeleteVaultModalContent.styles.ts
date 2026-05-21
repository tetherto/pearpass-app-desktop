import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  form: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing16}px`,
    width: '100%'
  },
  eraseRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%'
  },
  eraseLabel: {
    flex: 1,
    minWidth: 0
  },
  eraseLink: {
    marginLeft: `${rawTokens.spacing4}px`,
    marginRight: `${rawTokens.spacing4}px`
  }
})
