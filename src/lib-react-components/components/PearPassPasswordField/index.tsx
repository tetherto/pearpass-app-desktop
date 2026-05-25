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
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { EyeFilled, EyeOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'
import { NoticeText } from '../NoticeText'
import { PearPassPasswordFieldProps } from './types'

export const PearPassPasswordField = ({
  value,
  placeholder,
  onChange,
  isDisabled,
  error,
  testId = '@tetherto/pearpass-password-field'
}: PearPassPasswordFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const { theme } = useTheme()

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
            ? html`<${EyeOutlined} fill=${theme.colors.colorPrimary} width="24" height="24" />`
            : html`<${EyeFilled} fill=${theme.colors.colorPrimary} width="24" height="24" />`}
        </div>
      <//>
    <//>
  `
}
