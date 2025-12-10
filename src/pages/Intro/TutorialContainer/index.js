import { html } from 'htm/react'

import { GradientContainer } from '../GradientContainer'
import {
  Container,
  DescriptionText,
  Header,
  ImageContainer,
  InfoContainer
} from './styles'

export const TutorialContainer = ({ header, description, content }) => html`
  <${Container}>
    <${InfoContainer}>
      <${Header}>${header}<//>
      <${DescriptionText}>
        ${description.map(
          (part, index) => html`<span key=${index}> ${part} </span>`
        )}
      <//>
    <//>

    <${ImageContainer}>
      <${GradientContainer}> ${content} <//>
    <//>
  <//>
`
