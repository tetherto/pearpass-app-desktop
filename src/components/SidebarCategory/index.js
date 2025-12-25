import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  CategoryButton,
  CategoryDescription,
  CategoryIconWrapper,
  CategoryName,
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
 *  onClick: () => void,
 *  testId?: string
 * }} props
 */
export const SidebarCategory = ({
  size = 'default',
  isSelected = false,
  categoryName,
  quantity = 0,
  color,
  icon,
  onClick,
  testId
}) => html`
  <${CategoryButton}
    size=${size}
    color=${color}
    isSelected=${isSelected}
    onClick=${onClick}
    data-testid=${testId}
  >
    <${CategoryDescription} size=${size}>
      <${CategoryIconWrapper} isSelected=${isSelected} color=${color}>
        <${icon}
          color=${isSelected ? colors.black.mode1 : color}
          fill=${true}
          size="24px"
        />
      <//>

      <${CategoryName}>${categoryName}<//>
    <//>

    <${CategoryQuantity} size=${size}>${quantity}<//>
  <//>
`
