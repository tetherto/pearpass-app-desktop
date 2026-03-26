import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { CommonFileIcon, InputField } from '../../lib-react-components'

/**
 * @param {{
 *  value?: string,
 *  onChange?: (e?: string) => void,
 *  icon?: import('react').FC,
 *  label?: string,
 *  error?: string,
 *  additionalItems?: import('react').ReactNode,
 *  placeholder?: string,
 *  isDisabled?: boolean,
 *  onClick?: () => void,
 *  type?: 'text' | 'password' | 'url',
 *  variant?: 'default' | 'outline',
 *  testId?: string
 * }} props
 */
// UI displays this as "Comment"
export const InputFieldNote = (props) => {
  const { i18n } = useLingui()

  return html`<${InputField}
    testId=${props.testId}
    label=${i18n._('Comment')}
    placeholder=${i18n._('Add comment')}
    variant="outline"
    icon=${CommonFileIcon}
    ...${props}
  />`
}
