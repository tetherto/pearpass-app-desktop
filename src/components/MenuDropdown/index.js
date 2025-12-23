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
 *    items: Array<{name: string, icon?: import('react').ReactNode}>,
 *  testId?: string
 *  }} props
 */
export const MenuDropdown = ({ selectedItem, onItemSelect, items, testId }) => {
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
    <${MainWrapper} data-testid=${testId} ref=${wrapperRef}>
      <${MenuDropdownLabel}
        isHidden
        selectedItem=${selectedItem}
        isOpen=${isOpen}
        testId="menudropdown-defaultlabel-hidden"
      />

      <${Wrapper} isOpen=${isOpen}>
        <${MenuDropdownLabel}
          selectedItem=${selectedItem}
          isOpen=${isOpen}
          setIsOpen=${setIsOpen}
          testId=${`menudropdown-defaultlabel-${selectedItem?.name || 'No folder'}`}
        />

        ${isOpen &&
        html`<${DropDown}>
          ${currentItems.map(
            (item) => html`
              <${MenuDropdownItem}
                key=${item.name}
                testId=${`menudropdown-item-${item.name}`}
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
