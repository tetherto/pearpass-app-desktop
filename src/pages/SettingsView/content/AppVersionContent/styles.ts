import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'flex-end' as const,
    gap: `${rawTokens.spacing24}px`,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  descriptionLink: {
    fontWeight: rawTokens.weightMedium
  },

  fieldContainer: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    alignSelf: 'stretch' as const,
    gap: `${rawTokens.spacing12}px`,
    padding: `15px ${rawTokens.spacing12}px`,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.radius8}px`,
    width: '100%',
    boxSizing: 'border-box' as const
  }
})
