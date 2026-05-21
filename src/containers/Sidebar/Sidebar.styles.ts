import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

import { FADE_GRADIENT_HEIGHT, HEADER_MIN_HEIGHT } from '../../constants/layout'

export const SIDEBAR_WIDTH_EXPANDED = 250
export const SIDEBAR_WIDTH_COLLAPSED = 57

const SIDEBAR_HORIZONTAL_PADDING = rawTokens.spacing12
const FOLDERS_HEADER_HORIZONTAL_PADDING = rawTokens.spacing4

// Icon (16) + padding (4×2) + border (1×2).
const COLLAPSED_SMALL_ICON_BUTTON_WIDTH = 26
const COLLAPSED_CHEVRON_WIDTH = 16

// translateX offsets to re-center a flex-anchored child in the collapsed column.
export const COLLAPSE_BUTTON_CENTER_SHIFT_PX =
  (SIDEBAR_WIDTH_COLLAPSED - COLLAPSED_SMALL_ICON_BUTTON_WIDTH) / 2 -
  (SIDEBAR_WIDTH_COLLAPSED -
    SIDEBAR_HORIZONTAL_PADDING -
    COLLAPSED_SMALL_ICON_BUTTON_WIDTH)

export const FOLDERS_CHEVRON_CENTER_SHIFT_PX =
  (SIDEBAR_WIDTH_COLLAPSED - COLLAPSED_CHEVRON_WIDTH) / 2 -
  (SIDEBAR_HORIZONTAL_PADDING + FOLDERS_HEADER_HORIZONTAL_PADDING)

export const FOLDER_CONTEXT_MENU_WIDTH = 220

export const createStyles = (colors: ThemeColors, isCollapsed: boolean) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    backgroundColor: colors.colorSurfacePrimary,
    borderRight: `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
    transition: 'width 150ms ease'
  },

  vaultSelector: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing8,
    width: '100%',
    height: HEADER_MIN_HEIGHT,
    padding: rawTokens.spacing12,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const,
    flexShrink: 0
  },

  vaultIconHidden: {
    display: 'none' as const
  },

  vaultNameGroup: {
    flex: 1,
    minWidth: 0
  },

  vaultNameGroupHidden: {
    display: 'none' as const
  },

  vaultNameRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    minWidth: 0,
    cursor: 'pointer' as const,
    userSelect: 'none' as const
  },

  vaultNameText: {
    minWidth: 0,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    color: colors.colorTextPrimary
  },

  chevron: {
    flexShrink: 0,
    transition: 'transform 150ms ease'
  },

  chevronFlipped: {
    transform: 'rotate(180deg)'
  },

  collapseButtonSlot: {
    marginInlineStart: 'auto' as const,
    display: 'flex' as const,
    // Use the individual-transform properties so `translate` can animate
    // while `rotate` flips instantly.
    translate: `${isCollapsed ? COLLAPSE_BUTTON_CENTER_SHIFT_PX : 0}px`,
    rotate: `${isCollapsed ? 180 : 0}deg`,
    transition: 'translate 150ms ease'
  },

  scrollContainer: {
    position: 'relative' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0
  },

  scrollArea: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0,
    gap: rawTokens.spacing8,
    paddingInline: rawTokens.spacing12,
    paddingTop: rawTokens.spacing12,
    paddingBottom: FADE_GRADIENT_HEIGHT,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const
  },

  fadeGradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_GRADIENT_HEIGHT,
    pointerEvents: 'none' as const,
    background: `linear-gradient(180deg, ${colors.colorSurfacePrimary}00 0%, ${colors.colorSurfacePrimary} 100%)`
  },

  sectionList: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 1,
    width: '100%'
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.colorBorderPrimary,
    border: 'none',
    margin: 0,
    flexShrink: 0
  },

  foldersHeader: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    height: 32,
    padding: `${rawTokens.spacing8}px ${rawTokens.spacing4}px`,
    borderRadius: rawTokens.radius8,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  foldersHeaderToggle: {
    flex: 1,
    minWidth: 0
  },

  foldersHeaderToggleInner: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    cursor: 'pointer' as const,
    userSelect: 'none' as const
  },

  // Kept mounted and allowed to shrink so the chevron keeps its size when collapsed.
  foldersHeaderLabel: {
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 150ms ease',
    minWidth: 0,
    overflow: 'hidden' as const,
    whiteSpace: 'nowrap' as const
  },

  // Anchors the right-click ContextMenu so it opens just below the row,
  // aligned to its right edge, regardless of where the cursor was clicked.
  folderRow: {
    position: 'relative' as const,
    width: '100%'
  },

  folderRowMenuAnchor: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0
  },

  folderRowMenuTrigger: {
    display: 'block' as const,
    width: 0,
    height: 0
  },

  footerSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: isCollapsed ? ('center' as const) : ('stretch' as const),
    gap: 1,
    padding: rawTokens.spacing12,
    borderTop: `1px solid ${colors.colorBorderPrimary}`,
    backgroundColor: colors.colorSurfacePrimary,
    flexShrink: 0
  }
})
