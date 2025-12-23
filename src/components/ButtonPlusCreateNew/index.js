import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { Button } from './styles'
import { PlusIcon, XIcon } from '../../lib-react-components'

/**
 * @param {{
 *  isOpen: boolean
 *  testId?: string
 * }} props
 */
export const ButtonPlusCreateNew = ({ isOpen, testId }) => html`
  <${Button} data-testid=${testId}>
    <${isOpen ? XIcon : PlusIcon} color=${colors.black.mode1} />
  <//>
`
