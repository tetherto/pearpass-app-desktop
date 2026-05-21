import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

import { HEADER_MIN_HEIGHT } from '../../constants/layout'

export const createStyles = (colors: ThemeColors) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden' as const,
    backgroundColor: colors.colorSurfacePrimary
  },

  header: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing8}px`,
    height: `${HEADER_MIN_HEIGHT}px`,
    paddingInline: `${rawTokens.spacing12}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const,
    flexShrink: 0
  },

  backButton: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: 'none',
    border: 'none',
    cursor: 'pointer' as const,
    padding: `${rawTokens.spacing4}px`,
    borderRadius: `${rawTokens.radius8}px`,
    color: colors.colorTextPrimary,
    flexShrink: 0
  },

  headerTitle: {
    fontSize: `${rawTokens.fontSize14}px`,
    fontWeight: rawTokens.weightMedium,
    color: colors.colorTextPrimary,
    fontFamily: rawTokens.fontPrimary
  },

  body: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden' as const
  },

  sidebar: {
    display: 'flex' as const,
    width: '250px',
    flexShrink: 0,
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    alignSelf: 'stretch' as const,
    padding: `${rawTokens.spacing12}px`,
    overflowY: 'auto' as const,
    borderRight: `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const
  },

  sectionCard: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    gap: `${rawTokens.spacing4}px`,
    paddingBottom: `${rawTokens.spacing4}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`
  },

  sectionCardWithTopPadding: {
    paddingTop: `${rawTokens.spacing4}px`
  },

  sectionCardNoBorder: {
    paddingBottom: `${rawTokens.spacing8}px`
  },

  sectionHeaderItem: {
    width: '100%'
  },

  itemsTrack: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1px',
    marginLeft: `${rawTokens.spacing12}px`,
    borderLeft: `1px solid ${colors.colorBorderPrimary}`
  },

  itemRow: {
    position: 'relative' as const,
    paddingLeft: `${rawTokens.spacing12}px`,
    overflow: 'hidden' as const
  },

  itemAnchor: {
    position: 'absolute' as const,
    left: -2,
    top: rawTokens.spacing10,
    width: rawTokens.spacing12,
    height: rawTokens.spacing8,
    borderLeft: `1px solid ${colors.colorBorderPrimary}`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    borderBottomLeftRadius: `${rawTokens.spacing12}px`,
    pointerEvents: 'none' as const
  },

  itemWrapper: {
    borderRadius: `${rawTokens.radius8}px`,
    overflow: 'hidden' as const
  },

  contentArea: {
    flex: 1,
    padding: `${rawTokens.spacing20}px`,
    overflow: 'auto' as const,
    minWidth: 0
  }
})
