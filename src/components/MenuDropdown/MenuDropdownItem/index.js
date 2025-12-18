import { html } from 'htm/react'

import { FolderIcon } from '../../../lib-react-components'
import { DropDownItem } from '../styles'

/**
 * @param {{
 *    onClick: () => void,
 *    item: {name: string, icon?: import('react').ReactNode},
 *    testId?: string
 *  }} props
 */
export const MenuDropdownItem = ({ item, onClick, testId }) => html`
  <${DropDownItem} onClick=${() => onClick?.()} data-testid=${testId}>
    <${item.icon ?? FolderIcon} size="24" color=${item.color ?? undefined} />

    ${item.name}
  <//>
`
