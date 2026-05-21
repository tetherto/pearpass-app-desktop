import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: rawTokens.spacing8,
    gap: rawTokens.spacing32,
    position: 'relative' as const
  },
  browserMockup: {
    width: '100%',
    borderRadius: rawTokens.radius8,
    height: '80px',
    objectFit: 'cover' as const,
    userSelect: 'none' as const,
    pointerEvents: 'none' as const
  },
  textContent: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: rawTokens.spacing12,
    width: '100%',
    textAlign: 'center' as const,
    lineHeight: 'normal'
  },
  heading: {
    whiteSpace: 'pre-wrap' as const
  },
  description: {
    color: colors.colorTextSecondary,
    whiteSpace: 'pre-wrap' as const
  },
})
