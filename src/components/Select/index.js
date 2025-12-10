import { useState } from 'react'

import { html } from 'htm/react'

import { SelectItem } from './SelectItem'
import { SelectLabel } from './SelectLabel'
import { SelectWrapper, SelectDropdown } from './styles'
import { useOutsideClick } from '../../hooks/useOutsideClick'

/**
 * @param {{
 *    selectedItem?: { label: string },
 *    onItemSelect: (item: { label: string, value: string }) => void,
 *    items: Array<{ label: string, value: string }>,
 *    placeholder: string
 *  }} props
 */
export const Select = ({ selectedItem, onItemSelect, items, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useOutsideClick({
    onOutsideClick: () => {
      setIsOpen(false)
    }
  })

  const handleSelect = (item) => {
    onItemSelect(item)
    setIsOpen(false)
  }

  return html`
    <${SelectWrapper} ref=${wrapperRef}>
      <${SelectLabel}
        selectedItem=${selectedItem}
        isOpen=${isOpen}
        setIsOpen=${setIsOpen}
        placeholder=${placeholder}
      />

      ${isOpen &&
      html`<${SelectDropdown}>
        ${items.map(
          (item) => html`
            <${SelectItem}
              key=${item.label}
              item=${item}
              onClick=${() => handleSelect(item)}
            />
          `
        )}
      <//>`}
    <//>
  `
}
