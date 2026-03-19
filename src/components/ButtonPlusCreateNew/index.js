import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'
import { html } from 'htm/react'

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
