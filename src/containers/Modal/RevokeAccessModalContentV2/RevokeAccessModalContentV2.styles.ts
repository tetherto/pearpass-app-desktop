import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = () => ({
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%'
  },
  intro: {
    display: 'flex' as const,
    flexDirection: 'column' as const
  },
  bulletList: {
    margin: 0,
    paddingInlineStart: `${rawTokens.spacing20}px`,
    listStyleType: 'disc' as const,
    listStylePosition: 'outside' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`
  },
  bulletItem: {
    margin: 0,
    display: 'list-item' as const
  }
})
