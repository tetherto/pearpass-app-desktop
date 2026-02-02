import { html } from 'htm/react'

import { BadgeContainer, BadgeText, BadgeCount } from './styles'

/**
 * @param {{
 *  count: number,
 *  word: string,
 *  isNumberVisible?: boolean
 *  testId?: string
 * }} props
 */

export const BadgeTextItem = ({
  count,
  word,
  isNumberVisible = true,
  testId
}) =>
  html`<${BadgeContainer} data-testid=${testId}>
    ${isNumberVisible ? html`<${BadgeCount}>#${count}<//>` : null}
    <${BadgeText}>${word}<//>
  <//>`
