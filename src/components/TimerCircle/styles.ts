import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

export const styles = {
  wrapper: {
    width: 14,
    height: 14,
    flexShrink: 0
  },
  svg: {
    width: 14,
    height: 14,
    transform: 'rotate(-90deg)'
  },
  circleBg: {
    fill: 'none',
    stroke: `${colors.grey100.mode1}33`,
    strokeWidth: 1.5
  }
}
