import { html } from 'htm/react'

import { MenuCard, MenuItem } from './styles'
import { RECORD_ACTION_ICON_BY_TYPE } from '../../constants/recordActions'

/**
 * @param {{
 *  menuItems: Array<{
 *    name: string,
 *    type: string,
 *    click?: () => void,
 *  }>,
 *  variant: 'default' | 'compact',
 *  onClick?: () => void,
 * }}
 */
export const RecordActionsPopupContent = ({
  variant = 'default',
  menuItems,
  onClick
}) => html`
  <${MenuCard} variant=${variant}>
    ${menuItems.map(
      (item) => html`
        <${MenuItem}
          data-testid=${`recordaction-item-${item.type}`}
          key=${item.type}
          variant=${variant}
          onClick=${(e) => {
            e.stopPropagation()

            if (item.click) {
              item.click()
              return
            }

            onClick?.()
          }}
        >
          <${RECORD_ACTION_ICON_BY_TYPE[item.type]} size="24" />

          <p>${item.name}</p>
        <//>
      `
    )}
  <//>
`
