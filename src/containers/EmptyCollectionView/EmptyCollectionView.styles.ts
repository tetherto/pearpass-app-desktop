import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const CONTENT_MAX_WIDTH = 500
export const BUTTONS_MAX_WIDTH = 350
export const ILLUSTRATION_HEIGHT = 151

export const createStyles = () => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
    paddingInline: `${rawTokens.spacing12}px`,
    paddingBlock: '60px',
    width: '100%',
    boxSizing: 'border-box' as const
  },

  content: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing24}px`,
    width: '100%',
    maxWidth: `${CONTENT_MAX_WIDTH}px`
  },

  illustration: {
    width: '100%',
    height: `${ILLUSTRATION_HEIGHT}px`,
    overflow: 'hidden' as const,
    flexShrink: 0,
    display: 'flex' as const,
    justifyContent: 'center',
  },

  textBlock: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing6}px`,
    width: '100%',
    textAlign: 'center' as const
  },

  descriptionParagraph: {
    margin: 0
  },

  ctas: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%'
  },

  ctaButton: {
    width: '100%',
    maxWidth: `${BUTTONS_MAX_WIDTH}px`
  }
})
