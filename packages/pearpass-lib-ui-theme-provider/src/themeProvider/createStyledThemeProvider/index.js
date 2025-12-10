import { colors } from '../../colors'

const theme = {
  colors: colors
}

export const createStyledThemeProvider = (StyledThemeProvider, props) =>
  StyledThemeProvider({ theme: theme, ...props })
