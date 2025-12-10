import { html } from 'htm/react'

import {
  CloseButtonWrapper,
  Container,
  HighlightedDescription,
  Message,
  Title
} from './styles'
import {
  ButtonPrimary,
  ButtonRoundIcon,
  XIcon
} from '../../lib-react-components'

/**
 * @param {Object} props
 * @param {Function} props.onClose
 * @param {boolean} props.isVisible
 * @param {string} props.href
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} props.highlightedDescription
 * @param {string} props.buttonText
 * @returns {null|Object}
 */
export const BannerBox = ({
  onClose,
  isVisible,
  href,
  title,
  message,
  highlightedDescription,
  buttonText
}) => {
  if (!isVisible) return null

  return html`
    <${Container}>
      <${Title}>${title} <//>
      <${Message}> ${message} <//>
      <${HighlightedDescription}> ${highlightedDescription} <//>

      <a href=${href}>
        <${ButtonPrimary} onClick=${onClose}> ${buttonText} <//>
      </a>
      <${CloseButtonWrapper}>
        <${ButtonRoundIcon} startIcon=${XIcon} onClick=${onClose} />
      <//>
    <//>
  `
}
