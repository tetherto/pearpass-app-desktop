import { useState } from 'react'

import { html } from 'htm/react'

import {
  AdditionalItems,
  IconWrapper,
  Input,
  InputAreaWrapper,
  InputWrapper,
  MainWrapper,
  NoticeWrapper
} from './styles'
import {
  ButtonRoundIcon,
  EyeClosedIcon,
  EyeIcon,
  LockCircleIcon,
  NoticeText
} from '../../lib-react-components'

/**
 * @param {{
 *  value: string,
 *  olaceholder?: string,
 *  onChange: (value: string) => void,
 *  isDisabled: boolean,
 *  error: string,
 * }} props
 */
export const InputPearpassPassword = ({
  value,
  placeholder,
  onChange,
  isDisabled,
  error,
  isFilled = false
}) => {
  const [isPasswordVisible] = useState(false)

  const handleChange = (e) => {
    if (isDisabled) {
      return
    }
    onChange?.(e.target.value)
  }

  return html`
    <${InputWrapper} isFilled=${isFilled}>
      <${IconWrapper}> <${LockCircleIcon} size="24" /> <//>

      <${MainWrapper}>
        <${InputAreaWrapper}>
          <${Input}
            placeholder=${placeholder}
            value=${value}
            onChange=${handleChange}
            disabled=${isDisabled}
            type=${isPasswordVisible ? 'text' : 'password'}
          />
        <//>
        ${!!error?.length &&
        html` <${NoticeWrapper}>
          <${NoticeText} text=${error} type="error" />
        <//>`}
      <//>

      <${AdditionalItems}>
        <${ButtonRoundIcon}
          startIcon=${isPasswordVisible ? EyeClosedIcon : EyeIcon}
        />
      <//>
    <//>
  `
}
