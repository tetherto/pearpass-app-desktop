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
 * @param {string} props.testId
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
    <${Container} data-testid="bannerbox-container">
      <${Title}>${title} <//>
      <${Message}> ${message} <//>
      <${HighlightedDescription}> ${highlightedDescription} <//>

      <a href=${href}>
        <${ButtonPrimary} onClick=${onClose} testId="bannerbox-button-download">
          ${buttonText}
        <//>
      </a>
      <${CloseButtonWrapper}>
        <${ButtonRoundIcon}
          testId="bannerbox-button-close"
          startIcon=${XIcon}
          onClick=${onClose}
        />
      <//>
    <//>
  `
}
