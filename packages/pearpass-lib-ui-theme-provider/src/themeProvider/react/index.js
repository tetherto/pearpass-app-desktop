import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import { createStyledThemeProvider } from '../createStyledThemeProvider'

export const ThemeProvider = (props) =>
  createStyledThemeProvider(StyledThemeProvider, props)
