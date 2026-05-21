import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

const VAULT_LOCK_ICON_BACKGROUND = 'rgba(176, 217, 68, 0.18)'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    gap: `${rawTokens.spacing24}px`,
    width: '100%',
    flex: 1,
    minHeight: 0,
    boxSizing: 'border-box' as const
  },

  header: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`
  },

  section: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`
  },

  cardList: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    borderRadius: `${rawTokens.radius8}px`,
    overflow: 'visible' as const,
    backgroundColor: colors.colorSurfacePrimary
  },

  iconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: `${rawTokens.radius8}px`,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
    backgroundColor: VAULT_LOCK_ICON_BACKGROUND
  },

  actions: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`,
    flexShrink: 0
  },

  footer: {
    display: 'flex' as const,
    justifyContent: 'flex-end' as const,
    alignSelf: 'flex-end' as const,
    width: '100%',
    boxSizing: 'border-box' as const
  }
})
