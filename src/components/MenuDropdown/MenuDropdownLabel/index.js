import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { ArrowDownIcon, ArrowUpIcon } from '../../../lib-react-components'
import { MenuDropdownItem } from '../MenuDropdownItem'
import { Label } from '../styles'

/**
 * @param {{
 *    isHidden: boolean,
 *    selectedItem?: {name: string, icon?: import('react').ReactNode},
 *    isOpen: boolean,
 *    setIsOpen?: (isOpen: boolean) => void
 *  }} props
 */
export const MenuDropdownLabel = ({
  isHidden,
  selectedItem,
  isOpen,
  setIsOpen
}) => {
  const { i18n } = useLingui()

  return html`
    <${Label} isHidden=${isHidden} onClick=${() => setIsOpen?.(!isOpen)}>
      <${isOpen ? ArrowUpIcon : ArrowDownIcon} size="24" />

      ${selectedItem?.name
        ? html` <${MenuDropdownItem} item=${selectedItem} /> `
        : i18n._('No folder')}
    <//>
  `
}
