import { html } from 'htm/react'

import {
  Input,
  InputAreaWrapper,
  InputWrapper,
  MainWrapper,
  NoticeWrapper
} from './styles'
import { NoticeText } from '../../../lib-react-components'

/**
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  placeholder: string,
 *  isDisabled: boolean,
 *  error: string,
 * }} props
 */
export const PearPassInputField = ({
  placeholder,
  value,
  onChange,
  isDisabled,
  error
}) => {
  const handleChange = (e) => {
    if (isDisabled) {
      return
    }
    onChange?.(e.target.value)
  }

  return html`
    <${InputWrapper}>
      <${MainWrapper}>
        <${InputAreaWrapper}>
          <${Input}
            value=${value}
            onChange=${handleChange}
            disabled=${isDisabled}
            placeholder=${placeholder}
          />
        <//>
        ${!!error?.length &&
        html` <${NoticeWrapper}>
          <${NoticeText} text=${error} type="error" />
        <//>`}
      <//>
    <//>
  `
}
