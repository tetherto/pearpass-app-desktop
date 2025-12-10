import { html } from 'htm/react'

import { MenuCard, MenuItem } from './styles'
import { CheckIcon } from '../../lib-react-components'

/**
 * @param {{
 * menuItems: Array<string>,
 * onClick: (type: 'recent' | 'newToOld' | 'oldToNew') => void,
 * }}
 */
export const RecordSortActionsPopupContent = ({
  menuItems,
  onClick,
  onClose,
  selectedType
}) => {
  const handleMenuItemClick = (e, type) => {
    e.stopPropagation()

    onClick(type)

    onClose()
  }

  return html`
    <${MenuCard}>
      ${menuItems.map(
        (item) => html`
          <${MenuItem}
            key=${item.name}
            onClick=${(e) => handleMenuItemClick(e, item.type)}
          >
            <div>
              <${item.icon} size="24" />

              ${item.name}
            </div>

            ${selectedType === item.type && html`<${CheckIcon} size="24" />`}
          <//>
        `
      )}
    <//>
  `
}
