import { html } from 'htm/react'

import { Button } from './styles'
import { FolderIcon } from '../../icons/FolderIcon'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  type?: 'button' | 'submit'
 *  onClick: () => void
 * }} props
 */
export const ButtonFolder = ({ children, type = 'button', onClick }) => html`
  <${Button} onClick=${onClick} type=${type}>
    ${html`<${FolderIcon} size="21" />`} ${children}
  <//>
`
