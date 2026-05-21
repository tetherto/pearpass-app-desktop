import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  card: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    padding: `${rawTokens.spacing12}px`,
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    borderRadius: `${rawTokens.radius8}px`,
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const
  },
  cardGrouped: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    padding: `${rawTokens.spacing12}px`,
    backgroundColor: 'transparent',
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const
  },
  topRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing8}px`
  },
  innerColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing2}px`
  },
  timerRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing8}px`
  },
  timerTrack: {
    flex: 1,
    height: 6,
    borderRadius: `${rawTokens.radius8}px`,
    backgroundColor: colors.colorBorderPrimary,
    overflow: 'hidden' as const
  },
  timerFill: {
    height: '100%',
    borderRadius: `${rawTokens.radius8}px`
  },
  timerLabel: {
    minWidth: 28,
    textAlign: 'right' as const
  }
})
