import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const DEVICE_ACTIONS_MENU_WIDTH = 220

export const createStyles = (colors: ThemeColors) => ({
  list: {
    display: 'flex' as const,
    flexDirection: 'column' as const
  },
  iconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: `${rawTokens.radius8}px`,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
    backgroundColor: colors.colorSurfaceHover
  },
  emptyState: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: `${rawTokens.spacing24}px`
  }
})
