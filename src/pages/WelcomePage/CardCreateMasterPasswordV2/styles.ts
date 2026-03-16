import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit/theme'

export const createStyles = (colors: ThemeColors) => ({
  card: {
    background: colors.colorSurfacePrimary,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: '8px 8px 20px 20px',
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
    gap: '24px',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '500px',
    borderRadius: '8px'
  },

  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    width: '100%'
  },
  title: {
    fontFamily: "'Humble Nostalgia', sans-serif",
    fontSize: '28px',
    fontWeight: 400,
    color: colors.colorTextTertiary,
    margin: 0,
    lineHeight: 'normal'
  },
  subtitle: {
    color: colors.colorTextPrimary,
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 'normal',
    margin: 0
  },
  subtitleLink: {
    color: colors.colorPrimary,
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationStyle: 'solid' as const
  },

  fieldsWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    width: '100%'
  },

  passwordWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '8px',
    width: '100%',
    isolation: 'isolate' as const
  },

  toast: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: colors.colorSurfaceHover,
    border: `1px solid ${colors.colorBorderSecondary}`,
    borderTop: 'none',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    width: '100%',
    boxSizing: 'border-box' as const,
    zIndex: 1
  },
  toastIcon: {
    flexShrink: 0,
    width: '16px',
    height: '16px',
    color: colors.colorTextTertiary
  },
  toastText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: 400,
    color: colors.colorTextTertiary,
    lineHeight: 'normal',
    flex: 1
  },

  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  touText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: 400,
    color: colors.colorTextSecondary,
    lineHeight: 'normal',
    maxWidth: '302px',
    padding: '5px 0'
  },
  touLink: {
    color: colors.colorLinkText,
    textDecoration: 'underline',
    textDecorationStyle: 'solid' as const
  }
})
