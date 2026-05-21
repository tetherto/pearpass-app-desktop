import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const RECORD_ROW_CONTEXT_MENU_WIDTH = 240

export const createStyles = (colors: ThemeColors) => ({
  menuDivider: {
    width: '100%',
    height: 1,
    border: 'none',
    margin: 0,
    marginBlock: rawTokens.spacing4,
    backgroundColor: colors.colorBorderPrimary,
    flexShrink: 0
  }
})
