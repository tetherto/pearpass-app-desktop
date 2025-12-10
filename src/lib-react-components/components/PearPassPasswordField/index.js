import { useState } from 'react'

import { html } from 'htm/react'

import { EyeClosedIcon } from '../../icons/EyeClosedIcon'
import { EyeIcon } from '../../icons/EyeIcon'
import { LockCircleIcon } from '../../icons/LockCircleIcon'
import { ButtonRoundIcon } from '../ButtonRoundIcon'
import {
  AdditionalItems,
  IconWrapper,
  Input,
  InputAreaWrapper,
  InputWrapper,
  MainWrapper,
  NoticeWrapper
} from './styles'
import { NoticeText } from '../NoticeText'

/**
 * @param {{
 *  value: string,
 *  olaceholder?: string,
 *  onChange: (value: string) => void,
 *  isDisabled: boolean,
 *  error: string,
 * }} props
 */
export const PearPassPasswordField = ({
  value,
  placeholder,
  onChange,
  isDisabled,
  error
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleChange = (e) => {
    if (isDisabled) {
      return
    }
    onChange?.(e.target.value)
  }

  return html`
    <${InputWrapper}>
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
          onClick=${() => setIsPasswordVisible(!isPasswordVisible)}
        />
      <//>
    <//>
  `
}
