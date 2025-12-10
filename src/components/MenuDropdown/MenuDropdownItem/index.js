import { html } from 'htm/react'

import { FolderIcon } from '../../../lib-react-components'
import { DropDownItem } from '../styles'

/**
 * @param {{
 *    onClick: () => void,
 *    item: {name: string, icon?: import('react').ReactNode}
 *  }} props
 */
export const MenuDropdownItem = ({ item, onClick }) => html`
  <${DropDownItem} onClick=${() => onClick?.()}>
    <${item.icon ?? FolderIcon} size="24" color=${item.color ?? undefined} />

    ${item.name}
  <//>
`
