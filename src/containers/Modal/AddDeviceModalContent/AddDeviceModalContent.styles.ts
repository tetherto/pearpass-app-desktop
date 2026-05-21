import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.colorBorderPrimary,
    flexShrink: 0,
    border: 'none',
    padding: 0,
    margin: 0
  },
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: rawTokens.spacing12,
    boxSizing: 'border-box' as const
  },
  accessPanel: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    borderRadius: rawTokens.radius8,
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const
  },
  qrWrap: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: rawTokens.spacing24,
    marginBottom: rawTokens.spacing16,
  },
  qrInner: {
    width: 160,
    height: 160,
    padding: rawTokens.spacing10,
    borderRadius: rawTokens.radius8,
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  timerRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: rawTokens.spacing8,
    flexWrap: 'wrap' as const,
    marginBottom: rawTokens.spacing24,
  },
  timerTextRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: rawTokens.spacing4
  },
  vaultLinkSection: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    width: '100%',
    minWidth: 0,
    padding: rawTokens.spacing12,
    boxSizing: 'border-box' as const
  },
  vaultLinkTextColumn: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    gap: rawTokens.spacing8,
    flex: '1 1 auto' as const,
    minWidth: 0
  },
  vaultLinkValue: {
    display: 'block' as const,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const
  }
})
