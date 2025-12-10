import { html } from 'htm/react'

import { SelectItemWrapper } from './styles'

/**
 * @param {{
 *    onClick: () => void,
 *    item: { label: string }
 *  }} props
 */
export const SelectItem = ({ item, onClick }) => html`
  <${SelectItemWrapper} onClick=${() => onClick?.()}> ${item.label} <//>
`
