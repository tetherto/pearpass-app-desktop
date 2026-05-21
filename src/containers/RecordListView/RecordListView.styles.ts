import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

import { FADE_GRADIENT_HEIGHT } from '../../constants/layout'

export const createStyles = (colors: ThemeColors) => ({
  wrapper: {
    position: 'relative' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0,
    width: '100%'
  },

  scrollArea: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    paddingInline: `${rawTokens.spacing12}px`,
    paddingTop: `${rawTokens.spacing12}px`,
    paddingBottom: `${FADE_GRADIENT_HEIGHT}px`,
    display: 'flex' as const,
    flexDirection: 'column' as const
  },

  section: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 2
  },

  sectionHeader: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`,
    paddingBlock: `${rawTokens.spacing8}px`,
    paddingInline: `${rawTokens.spacing4}px`,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer' as const,
    userSelect: 'none' as const,
    color: colors.colorTextSecondary,
    width: '100%'
  },

  staticSectionHeader: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`,
    paddingBlock: `${rawTokens.spacing8}px`,
    paddingInline: `${rawTokens.spacing4}px`,
    background: 'transparent',
    border: 'none',
    userSelect: 'none' as const,
    color: colors.colorTextPrimary,
    width: '100%'
  },

  sectionHeaderChevron: {
    width: 16,
    height: 16,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transition: 'transform 150ms ease',
    flexShrink: 0
  },

  sectionHeaderChevronCollapsed: {
    transform: 'rotate(-90deg)'
  },

  sectionList: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 1
  },

  recordRow: {
    cursor: 'pointer' as const
  },

  divider: {
    width: '100%',
    height: 1,
    alignSelf: 'stretch' as const,
    backgroundColor: colors.colorBorderPrimary,
    marginBlock: `${rawTokens.spacing8}px`,
    flexShrink: 0
  },

  rowRightElement: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`
  },

  rowChevron: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transform: 'rotate(-90deg)'
  },

  fadeGradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_GRADIENT_HEIGHT,
    pointerEvents: 'none' as const,
    background: `linear-gradient(180deg, ${colors.colorSurfacePrimary}00 0%, ${colors.colorSurfacePrimary} 100%)`
  }
})
