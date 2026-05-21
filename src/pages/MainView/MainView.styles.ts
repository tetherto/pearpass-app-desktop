import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
    backgroundColor: colors.colorSurfacePrimary,
    overflow: 'hidden' as const
  }
})
