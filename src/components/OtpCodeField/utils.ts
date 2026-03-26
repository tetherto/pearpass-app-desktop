import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

export const getTimerColor = (expiring: boolean): string =>
  expiring ? colors.errorRed.mode1 : colors.primary400.mode1
