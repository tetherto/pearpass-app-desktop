import { html } from 'htm/react'

import { BlurredBackground, ChildrenContainer, Container } from './styles'

export const GradientContainer = ({ children, blurSize = 'sm' }) => html`
  <${Container}>
    <${BlurredBackground} blurSize=${blurSize} />
    <${ChildrenContainer}> ${children} <//>
  <//>
`
