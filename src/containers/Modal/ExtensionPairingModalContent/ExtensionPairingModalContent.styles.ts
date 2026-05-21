import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing16}px`
  },
  instructionsBox: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`,
    padding: `${rawTokens.spacing16}px`,
    backgroundColor: colors.colorSurfaceHover,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.radius8}px`
  },
  instructionRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`,
    flexWrap: 'wrap' as const
  }
})
