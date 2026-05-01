import { rawTokens, type ThemeColors } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (
  colors: ThemeColors,
  { hasError }: { hasError: boolean }
) => ({
  section: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%'
  },
  groupContainer: {
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderRadius: `${rawTokens.spacing8}px`,
    overflow: 'hidden' as const,
    backgroundColor: colors.colorSurfacePrimary,
    borderColor: hasError
      ? colors.colorSurfaceDestructiveElevated
      : colors.colorBorderPrimary
  },
  optionSection: {
    padding: `${rawTokens.spacing12}px`,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`
  },
  headerRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: `${rawTokens.spacing12}px`
  },
  headerInfo: { flex: 1 },
  grid: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: `${rawTokens.spacing12}px`
  },
  wordInputWrapper: {
    width: `calc(50% - ${rawTokens.spacing12 / 2}px)`
  },
  optionSectionWithBorder: {
    borderTop: `1px solid ${colors.colorBorderPrimary}`
  },
  copyIconWrapper:{
    display: "flex",
    justifyContent: 'space-between',
    alignItems: "center"
  }
})
