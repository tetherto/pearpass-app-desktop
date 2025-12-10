import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  SelectedListItemIconContainer,
  ListItemActions,
  ListItemContainer,
  ListItemDate,
  ListItemDescription,
  ListItemInfo,
  ListItemName
} from './styles'
import {
  BrushIcon,
  CheckIcon,
  DeleteIcon,
  LockCircleIcon,
  ShareIcon
} from '../../lib-react-components'

export const ListItem = ({
  itemName,
  itemDateText,
  onClick,
  onShareClick,
  onEditClick,
  onDeleteClick,
  isSelected
}) => html`
  <${ListItemContainer} isSelected=${isSelected} onClick=${onClick}>
    <${ListItemInfo}>
      ${isSelected
        ? html` <${SelectedListItemIconContainer}>
            <${CheckIcon} size="24" color=${colors.black.mode1} />
          <//>`
        : html`<${LockCircleIcon} size="24" />`}

      <${ListItemDescription}>
        <${ListItemName}>${itemName}<//>
        ${itemDateText && html`<${ListItemDate}> ${itemDateText}<//>`}
      <//>
    <//>

    <${ListItemActions}>
      ${onShareClick &&
      html`
        <span onClick=${onShareClick}>
          <${ShareIcon} />
        </span>
      `}
      ${onEditClick &&
      html`<span onClick=${onEditClick}> <${BrushIcon} /></span>`}
      ${onDeleteClick &&
      html`<span onClick=${onShareClick}><${DeleteIcon} /></span>`}
    <//>
  <//>
`
