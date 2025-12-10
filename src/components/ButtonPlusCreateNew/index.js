import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { Button } from './styles'
import { PlusIcon, XIcon } from '../../lib-react-components'

/**
 * @param {{
 *  isOpen: boolean
 * }} props
 */
export const ButtonPlusCreateNew = ({ isOpen }) => html`
  <${Button}>
    <${isOpen ? XIcon : PlusIcon} color=${colors.black.mode1} />
  <//>
`
