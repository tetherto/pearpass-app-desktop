import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit/theme'

export const createStyles = (colors: ThemeColors) => ({
  customHeader: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  headerTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 'normal',
    color: colors.colorTextPrimary,
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
    padding: '8px',
    gap: '32px',
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
})
