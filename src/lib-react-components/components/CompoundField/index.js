import { html } from 'htm/react'

import { CompoundFieldComponent } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  isDisabled?: boolean
 * }} props
 */

export const CompoundField = ({ children, isDisabled }) => html`
  <${CompoundFieldComponent} isDisabled=${isDisabled}> ${children} <//>
`
