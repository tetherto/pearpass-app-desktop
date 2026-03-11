import { colors } from 'pearpass-lib-ui-theme-provider'

const SIZE = 14

export const styles = {
  wrapper: {
    width: SIZE,
    height: SIZE,
    flexShrink: 0
  },
  svg: {
    width: SIZE,
    height: SIZE,
    transform: 'rotate(-90deg)'
  },
  circleBg: {
    fill: 'none',
    stroke: `${colors.grey100.mode1}33`,
    strokeWidth: 1.5
  }
}
