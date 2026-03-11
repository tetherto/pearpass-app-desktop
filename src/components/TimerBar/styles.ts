import { colors } from 'pearpass-lib-ui-theme-provider'

export const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 10px 6px',
    width: '100%'
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 20,
    background: `${colors.grey100.mode1}33`,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 10
  },
  timer: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 500,
    minWidth: 22,
    textAlign: 'right' as const
  }
}
