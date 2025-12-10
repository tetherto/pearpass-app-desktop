import React, { useState } from 'react'

import { html } from 'htm/react'

import { MenuDropdownItem } from './MenuDropdownItem'
import { MenuDropdownLabel } from './MenuDropdownLabel'
import { DropDown, MainWrapper, Wrapper } from './styles'
import { useOutsideClick } from '../../hooks/useOutsideClick'

/**
 * @param {{
 *    selectedItem?: {name: string, icon?: import('react').ReactNode},
 *    onItemSelect: (item: {name: string, icon?: import('react').ReactNode}) => void,
 *    items: Array<{name: string, icon?: import('react').ReactNode}>
 *  }} props
 */
export const MenuDropdown = ({ selectedItem, onItemSelect, items }) => {
  const [isOpen, setIsOpen] = useState(false)

  const currentItems = React.useMemo(
    () => items.filter((item) => item?.name !== selectedItem?.name),
    [items, selectedItem]
  )

  const wrapperRef = useOutsideClick({
    onOutsideClick: () => {
      setIsOpen(false)
    }
  })

  const handleFolderSelect = (item) => {
    onItemSelect(item)

    setIsOpen(false)
  }

  return html`
    <${MainWrapper} ref=${wrapperRef}>
      <${MenuDropdownLabel}
        isHidden
        selectedItem=${selectedItem}
        isOpen=${isOpen}
      />

      <${Wrapper} isOpen=${isOpen}>
        <${MenuDropdownLabel}
          selectedItem=${selectedItem}
          isOpen=${isOpen}
          setIsOpen=${setIsOpen}
        />

        ${isOpen &&
        html`<${DropDown}>
          ${currentItems.map(
            (item) => html`
              <${MenuDropdownItem}
                key=${item.name}
                item=${item}
                onClick=${() => handleFolderSelect(item)}
              />
            `
          )}
        <//>`}
      <//>
    <//>
  `
}
