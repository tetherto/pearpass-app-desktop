import { html } from 'htm/react'

import { Container } from './styles'
import { YellowErrorIcon } from '../../lib-react-components'

export const NoticeContainer = ({ text }) => html`
  <${Container}>
    <${YellowErrorIcon} size="19" />
    ${text}
  <//>
`
