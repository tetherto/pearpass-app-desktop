import { useRef, useState } from 'react'

import { html } from 'htm/react'

import {
  MainWrapper,
  Label,
  Input,
  AdditionalItems,
  IconWrapper,
  DefaultInputWrapper,
  OutlineInputWrapper,
  NoticeWrapper,
  InputAreaWrapper,
  InputOverlay,
  InsideWrapper
} from './styles'
import { NoticeText } from '../NoticeText'

/**
 *
 * @param {{
 *  value?: string,
 *  onChange?: (e?: string) => void,
 *  icon?: import('react').FC,
 *  label?: string,
 *  error?: string,
 *  additionalItems?: import('react').ReactNode,
 *  belowInputContent?: import('react').ReactNode,
 *  placeholder?: string,
 *  isDisabled?: boolean,
 *  onClick?: (value: string) => void,
 *  type?: 'text' | 'password' | 'url',
 *  variant?: 'default' | 'outline'
 *  overlay?: import('react').ReactNode
 *  autoFocus?: boolean
 * }} props
 */
export const InputField = ({
  value,
  onChange,
  icon,
  label,
  error,
  additionalItems,
  belowInputContent,
  placeholder,
  isDisabled,
  onClick,
  type = 'text',
  variant = 'default',
  overlay,
  autoFocus
}) => {
  const inputRef = useRef(null)

  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e) => {
    if (isDisabled) {
      return
    }
    const input = e.target

    onChange?.(input.value)
  }

  const handleClick = () => {
    inputRef.current?.focus()

    onClick?.(value)

    if (!isDisabled) {
      setIsFocused(true)
    }
  }

  const getStyedWrapperByVariant = () => {
    switch (variant) {
      case 'default':
        return DefaultInputWrapper
      case 'outline':
        return OutlineInputWrapper
      default:
        return DefaultInputWrapper
    }
  }

  return html`
    <${getStyedWrapperByVariant()} onClick=${() => handleClick()}>
      <${InsideWrapper}>
        ${!!icon && html` <${IconWrapper}> <${icon} size="24" /> <//>`}

        <${MainWrapper}>
          <${Label}> ${label} <//>

          <${InputAreaWrapper}>
            <${Input}
              ref=${inputRef}
              value=${value}
              onChange=${handleChange}
              placeholder=${placeholder}
              readOnly=${isDisabled}
              onFocus=${() => setIsFocused(true)}
              onBlur=${() => setIsFocused(false)}
              type=${type}
              hasOverlay=${!!overlay && !isFocused}
              autoFocus=${autoFocus}
              isDisabled=${isDisabled}
            />

            ${!isFocused && html`<${InputOverlay}> ${overlay} <//>`}
          <//>

          ${!!error?.length &&
          html` <${NoticeWrapper}>
            <${NoticeText} text=${error} type="error" />
          <//>`}
        <//>

        ${!!additionalItems &&
        html`
          <${AdditionalItems} onMouseDown=${(e) => e.stopPropagation()}>
            ${additionalItems}
          <//>
        `}
      <//>
      ${!!belowInputContent && belowInputContent}
    <//>
  `
}
