import React from 'react'
import { html } from 'htm/react'

import {
  Wrapper,
  TextAreaWrapper,
  AdditionalItemsWrapper,
  TextAreaComponent,
  ReportTextAreaComponent
} from './styles'

type Variant = 'default' | 'report'

interface Props {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  onClick?: (value: string) => void
  variant?: Variant
  testId?: string
  additionalItems?: React.ReactNode
}

export const TextArea = ({
  value = '',
  onChange,
  placeholder,
  isDisabled = false,
  onClick,
  variant = 'default',
  testId = 'text-area',
  additionalItems
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const TextAreaEl = variant === 'report' ? ReportTextAreaComponent : TextAreaComponent

  return html`
    <${Wrapper} data-testid=${testId} onClick=${handleClick}>
      <${TextAreaWrapper}>
        <${TextAreaEl}
          value=${value}
          onChange=${handleChange}
          placeholder=${placeholder}
          readOnly=${isDisabled}
          isDisabled=${isDisabled}
          hasAdditionalItems=${!!additionalItems}
        />
        ${!!additionalItems && html`
          <${AdditionalItemsWrapper} onMouseDown=${(e: React.MouseEvent) => e.stopPropagation()}>
            ${additionalItems}
          </${AdditionalItemsWrapper}>
        `}
      </${TextAreaWrapper}>
    </${Wrapper}>
  `
}
