import { html } from 'htm/react'

import { ReportTextAreaComponent, TextAreaComponent } from './styles'

/**
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  placeholder: string,
 *  isDisabled: boolean,
 *  onClick: (value: string) => void,
 *  variant: 'default' | 'report',
 *  testId?: string
 * }} props
 */
export const TextArea = ({
  value,
  onChange,
  placeholder,
  isDisabled,
  onClick,
  variant,
  testId = 'text-area'
}) => {
  const handleChange = (e) => {
    if (isDisabled) {
      return
    }

    onChange?.(e.target.value)
  }

  const handleClick = () => {
    if (isDisabled) {
      return
    }

    onClick?.(value)
  }

  return html`
    <${variant === 'report' ? ReportTextAreaComponent : TextAreaComponent}
      value=${value}
      data-testid=${testId}
      onChange=${handleChange}
      placeholder=${placeholder}
      disabled=${isDisabled}
      onClick=${handleClick}
    />
  `
}
