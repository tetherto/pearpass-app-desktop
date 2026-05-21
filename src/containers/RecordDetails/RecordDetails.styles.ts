import { rawTokens, type ThemeColors } from '@tetherto/pearpass-lib-ui-kit'

import { HEADER_MIN_HEIGHT } from '../../constants/layout'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    height: '100%',
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const,
    overflowY: 'auto' as const
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    height: `${HEADER_MIN_HEIGHT}px`,
    paddingInline: `${rawTokens.spacing12}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const,
    flexShrink: 0
  },
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`,
    padding: `${rawTokens.spacing16}px`
  }
})
