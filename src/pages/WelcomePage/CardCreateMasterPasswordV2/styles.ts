import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  card: {
    background: colors.colorSurfacePrimary,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.radius8}px ${rawTokens.radius8}px ${rawTokens.radius20}px ${rawTokens.radius20}px`,
    paddingTop: '55px',
    paddingBottom: '55px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '35px',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box' as const
  },

  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing24}px`,
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '500px'
  },

  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing6}px`,
    width: '100%'
  },

  fieldsWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    width: '100%'
  },

  passwordWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    isolation: 'isolate' as const
  },

  toast: {
    display: 'flex',
    gap: `${rawTokens.spacing8}px`,
    alignItems: 'center',
    padding: `${rawTokens.spacing12}px`,
    backgroundColor: colors.colorSurfaceHover,
    border: `1px solid ${colors.colorBorderSecondary}`,
    borderTop: 'none',
    borderBottomLeftRadius: `${rawTokens.radius8}px`,
    borderBottomRightRadius: `${rawTokens.radius8}px`,
    width: '100%',
    boxSizing: 'border-box' as const,
    zIndex: 1
  },
  toastIcon: {
    flexShrink: 0,
    width: `${rawTokens.spacing16}px`,
    height: `${rawTokens.spacing16}px`,
    color: colors.colorTextTertiary
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  touContainer: {
    padding: '5px 0',
    maxWidth: '302px',
  },
  touText: {
    color: colors.colorTextSecondary
  },
  touLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: `${rawTokens.fontSize12}px`,
    fontWeight: 400,
    color: colors.colorLinkText,
    textDecoration: 'underline',
    textDecorationStyle: 'solid' as const
  }
})
