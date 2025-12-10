import { html } from 'htm/react'

import { HighlightedText, NumberSpan, SymbolSpan } from './styles'

/**
 *
 * @param {{
 *  text: string
 * }} props
 */
export const HighlightString = ({ text }) => {
  const highlightText = (text) => {
    const regex = /(\d+|[^a-zA-Z\d\s])/g
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (/^\d+$/.test(part)) {
        return html`<${NumberSpan} key=${index}>${part}<//>`
      }

      if (/[^a-zA-Z\d\s]/.test(part)) {
        return html`<${SymbolSpan} key=${index}>${part}<//>`
      }

      return part
    })
  }

  return html`<${HighlightedText}>${highlightText(text)}<//>`
}
