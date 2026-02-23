import { html } from 'htm/react'

import { Label } from './styles'
import { ArrowDownIcon, ArrowUpIcon } from '../../../lib-react-components'

/**
 * @param {{
 *    selectedItem?: { label: string },
 *    isOpen: boolean,
 *    setIsOpen?: (isOpen: boolean) => void,
 *    placeholder: string
 *  }} props
 */
export const SelectLabel = ({
  selectedItem,
  isOpen,
  setIsOpen,
  placeholder,
  testId
}) => html`
  <${Label} data-testid=${testId} onClick=${() => setIsOpen?.(!isOpen)}>
    <span> ${selectedItem?.label || placeholder} </span>
    <${isOpen ? ArrowUpIcon : ArrowDownIcon} size="24" />
  <//>
`
