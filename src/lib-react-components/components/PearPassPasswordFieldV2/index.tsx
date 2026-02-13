import { useState } from 'react'

import { html } from 'htm/react'

import {
  AdditionalItems,
  Input,
  InputAreaWrapper,
  InputWrapper,
  MainWrapper,
  NoticeWrapper
} from './styles'
import { EyeClosedIcon } from '../../icons/EyeClosedIcon'
import { EyeIcon } from '../../icons/EyeIcon'
import { NoticeText } from '../NoticeText'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { PearPassPasswordFieldV2Props } from './types'

export const PearPassPasswordFieldV2 = ({
  value,
  placeholder,
  onChange,
  isDisabled,
  error,
  testId = 'pearpass-password-field-v2'
}: PearPassPasswordFieldV2Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            data-testid=${testId}
            placeholder=${placeholder}
            value=${value}
            onChange=${handleChange}
            disabled=${isDisabled}
            type=${isPasswordVisible ? 'text' : 'password'}
          />
        <//>
        ${!!error?.length &&
        html` <${NoticeWrapper}>
          <${NoticeText}
            text=${error}
            type="error"
            testId=${`password-error-${error}`}
          />
        <//>`}
      <//>

      <${AdditionalItems}>
        <div
          data-testid=${`${testId}-toggle`}
          onClick=${() => setIsPasswordVisible(!isPasswordVisible)}
        >
          ${isPasswordVisible
            ? html`<${EyeClosedIcon} color=${colors.primary400.mode1} />`
            : html`<${EyeIcon} color=${colors.primary400.mode1} />`}
        </div>
      <//>
    <//>
  `
}
