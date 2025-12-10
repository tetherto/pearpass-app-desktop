import { html } from 'htm/react'

import { Wrapper } from './styles'

export const TooltipWrapper = ({ children }) =>
  html`<${Wrapper}>${children}<//>`
