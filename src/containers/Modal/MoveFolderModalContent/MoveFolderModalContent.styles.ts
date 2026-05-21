import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

import { FADE_GRADIENT_HEIGHT } from '../../../constants/layout'
import { withAlpha } from '../../../utils/withAlpha'

export const createStyles = (colors: ThemeColors) => ({
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`,
    width: '100%'
  },
  itemsListHeader: {
    marginBottom: `${rawTokens.spacing16}px`,
  },
  itemRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%'
  },
  itemText: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing4}px`,
    minWidth: 0,
    flex: 1
  },
  itemsListWrapper: {
    position: 'relative' as const,
    width: '100%'
  },
  itemsList: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing24}px`,
    width: '100%',
    maxHeight: '220px',
    overflowY: 'auto' as const,
    paddingLeft: `${rawTokens.spacing12}px`,
  },
  fadeGradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_GRADIENT_HEIGHT,
    pointerEvents: 'none' as const,
    background: `linear-gradient(180deg, ${withAlpha(colors.colorSurfacePrimary, 0)} 0%, ${colors.colorSurfacePrimary} 100%)`
  },
  destinationHint: {
    marginTop: `${rawTokens.spacing16}px`,
    width: '100%'
  },
  chipRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%',
    maxHeight: '100px',
    overflowY: 'auto' as const,
  }
})
