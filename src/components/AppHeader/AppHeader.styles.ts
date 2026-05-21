import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (
  colors: ThemeColors,
) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: '12px 16px',
    width: '100%',
    gap: `${rawTokens.spacing16}px`,
    marginBottom: 0,
    boxSizing: 'border-box' as const
  },
  flexSpacer: {
    flex: '1 1 0',
    minWidth: 0
  },
  searchWrap: {
    display: "flex",
    justifyContent: "center",
    width: '100%',
  },
  search:{
    maxWidth: '400px',
    width: '100%',
  },
  searchField: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing8}px`,
    width: '100%',
    paddingBlock: `${rawTokens.spacing10}px`,
    paddingInline: `${rawTokens.spacing12}px`,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderSearchField,
    backgroundColor: colors.colorSurfaceSearchField,
    boxSizing: 'border-box' as const
  },

  actions: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: `${rawTokens.spacing8}px`
  }
})
