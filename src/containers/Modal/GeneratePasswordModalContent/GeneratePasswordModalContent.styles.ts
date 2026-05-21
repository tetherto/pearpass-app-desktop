import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing24}px`,
    width: '100%'
  },
  section: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`
  },
  groupedCard: {
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.spacing8}px`,
    overflow: 'hidden' as const,
    backgroundColor: colors.colorSurfacePrimary
  },
  generatedPasswordBlock: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: `${rawTokens.spacing16}px`,
    padding: `${rawTokens.spacing24}px ${rawTokens.spacing12}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    textAlign: 'center' as const,
    wordBreak: 'break-all' as const
  },
  optionRow: {
    padding: `${rawTokens.spacing12}px`,
    cursor: 'pointer' as const
  },
  optionRowDivider: {
    borderBottom: `1px solid ${colors.colorBorderPrimary}`
  },
  singleRowCard: {
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.spacing8}px`,
    backgroundColor: colors.colorSurfacePrimary,
    padding: `${rawTokens.spacing20}px ${rawTokens.spacing12}px`
  },
  sliderRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing12}px`
  },
  sliderLabel: {
    width: 72,
    flexShrink: 0
  },
  slider: {
    flex: 1,
    minWidth: 0
  },
  settingRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: `${rawTokens.spacing12}px`,
    padding: `${rawTokens.spacing12}px`
  }
})
