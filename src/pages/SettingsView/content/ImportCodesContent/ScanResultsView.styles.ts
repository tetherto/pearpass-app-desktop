import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing16}px`
  },

  tableLabel: {
    paddingBottom: `${rawTokens.spacing8}px`
  },

  tableOuter: {
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.radius8}px`,
    overflow: 'hidden' as const,
    display: 'grid' as const,
    gridTemplateColumns: '1fr 1fr auto'
  },

  tableHeaderRow: {
    display: 'contents' as const
  },

  tableRow: {
    display: 'contents' as const
  },

  tableCellRowDivider: {
    borderBottom: `1px solid ${colors.colorBorderPrimary}`
  },

  tableHeaderCell1: {
    padding: `${rawTokens.spacing12}px`,
    borderRight: `1px solid ${colors.colorBorderPrimary}`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing8}px`,
    minWidth: 0
  },

  tableHeaderCell2: {
    padding: `${rawTokens.spacing12}px`,
    borderRight: `1px solid ${colors.colorBorderPrimary}`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    minWidth: 0
  },

  tableHeaderCell3: {
    padding: `${rawTokens.spacing12}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`
  },

  tableCell1: {
    borderRight: `1px solid ${colors.colorBorderPrimary}`,
    minWidth: 0
  },

  tableCell2: {
    borderRight: `1px solid ${colors.colorBorderPrimary}`,
    minWidth: 0
  },

  tableCell3: {
    padding: `${rawTokens.spacing12}px`,
    display: 'flex' as const,
    justifyContent: 'flex-end' as const,
    flexShrink: 0
  },

  noMatchIcon: {
    width: 32,
    height: 32,
    borderRadius: `${rawTokens.radius8}px`,
    background: colors.colorSurfaceHover,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0
  },

  footer: {
    display: 'flex' as const,
    justifyContent: 'flex-end' as const,
    paddingTop: `${rawTokens.spacing8}px`
  }
})
