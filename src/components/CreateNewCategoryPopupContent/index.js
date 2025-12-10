import { html } from 'htm/react'

import { MenuItem, MenuList } from './styles'
import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../../constants/recordIconByType'

/**
 * @param {{
 * menuItems: Array<string>,
 * onClick: () => void,
 * }}
 */
export const CreateNewCategoryPopupContent = ({ menuItems, onClick }) => {
  const handleMenuItemClick = (e, item) => {
    e.stopPropagation()

    onClick(item)
  }

  return html`
    <${MenuList}>
      ${menuItems?.map((item) => {
        const Icon = RECORD_ICON_BY_TYPE?.[item.type]

        return html`<${MenuItem}
          color=${RECORD_COLOR_BY_TYPE?.[item.type]}
          key=${item.type}
          onClick=${(e) => handleMenuItemClick(e, item)}
        >
          ${Icon &&
          html`<${Icon}
            size="24"
            fill=${true}
            color=${RECORD_COLOR_BY_TYPE?.[item.type]}
          />`}
          ${item.name}
        <//>`
      })}
    <//>
  `
}
