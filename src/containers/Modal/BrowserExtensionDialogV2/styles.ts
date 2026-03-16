import { darkTheme } from '@tetherto/pearpass-lib-ui-kit/theme'

const { colors } = darkTheme

export const styles = {
  dialog: {
    position: 'relative' as const,
    zIndex: 1,
    backgroundColor: colors.colorSurfacePrimary,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: '8px',
    width: '500px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden'
  },
  header: {
    display: 'flex' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    overflow: 'hidden'
  },
  headerTitle: {
    color: colors.colorTextPrimary,
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 'normal',
    margin: 0,
    whiteSpace: 'nowrap' as const
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: colors.colorTextPrimary,
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    borderRadius: '6px',
    flexShrink: 0
  },
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: '24px',
    gap: '32px',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    position: 'relative' as const
  },
  browserMockup: {
    width: '100%',
    borderRadius: '8px',
    height: '80px',
    objectFit: 'cover' as const,
    userSelect: 'none' as const,
    pointerEvents: 'none' as const
  },
  textContent: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '12px',
    width: '100%',
    textAlign: 'center' as const,
    lineHeight: 'normal'
  },
  heading: {
    fontFamily: "'Humble Nostalgia', sans-serif",
    fontSize: '28px',
    fontWeight: 400,
    color: colors.colorTextPrimary,
    margin: 0,
    whiteSpace: 'pre-wrap' as const
  },
  description: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    color: colors.colorTextSecondary,
    margin: 0,
    whiteSpace: 'pre-wrap' as const
  },
  fadeGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '20px',
    background: `linear-gradient(to bottom, rgba(21,24,14,0), rgba(21,24,14,0.7) 55%, ${colors.colorSurfacePrimary})`,
    pointerEvents: 'none' as const
  },
  footer: {
    display: 'flex' as const,
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `1px solid ${colors.colorBorderPrimary}`,
    overflow: 'hidden',
    alignItems: 'center'
  }
}
