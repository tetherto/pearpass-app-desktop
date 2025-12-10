import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'

import { createStyledThemeProvider } from '../createStyledThemeProvider'

export const ThemeProvider = (props) =>
  createStyledThemeProvider(StyledThemeProvider, props)
