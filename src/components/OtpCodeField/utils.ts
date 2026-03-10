import { DefaultTheme } from 'styled-components'

export const getTimerColor = (theme: DefaultTheme, expiring: boolean): string =>
  expiring ? theme.colors.errorRed.mode1 : theme.colors.primary400.mode1
