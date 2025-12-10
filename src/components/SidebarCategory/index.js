import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  CategoryButton,
  CategoryDescription,
  CategoryIconWrapper,
  CategoryQuantity
} from './styles'

/**
 * @param {{
 *  size: 'default' | 'tight',
 *  isSelected: boolean,
 *  categoryName: string,
 *  quantity: number,
 *  color: string,
 *  icon: import('react').ReactNode,
 *  onClick: () => void
 * }} props
 */
export const SidebarCategory = ({
  size = 'default',
  isSelected = false,
  categoryName,
  quantity = 0,
  color,
  icon,
  onClick
}) => html`
  <${CategoryButton}
    size=${size}
    color=${color}
    isSelected=${isSelected}
    onClick=${onClick}
  >
    <${CategoryDescription} size=${size}>
      <${CategoryIconWrapper} isSelected=${isSelected} color=${color}>
        <${icon}
          color=${isSelected ? colors.black.mode1 : color}
          fill=${true}
          size="24px"
        />
      <//>

      <span>${categoryName}</span>
    <//>

    <${CategoryQuantity} size=${size}>${quantity}<//>
  <//>
`
