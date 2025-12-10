import { html } from 'htm/react'

import { BadgeContainer, BadgeText, BadgeCount } from './styles'

/**
 * @param {{
 *  count: number,
 *  word: string,
 *  isNumberVisible?: boolean
 * }} props
 */

export const BadgeTextItem = ({ count, word, isNumberVisible = true }) =>
  html`<${BadgeContainer}>
    ${isNumberVisible ? html`<${BadgeCount}>#${count}<//>` : null}
    <${BadgeText}>${word}<//>
  <//>`
