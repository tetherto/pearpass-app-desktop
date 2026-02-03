import React, { useRef, useState } from 'react'

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

type InputType = 'text' | 'password' | 'url'
type InputVariant = 'default' | 'outline'

interface Props {
  value?: string
  onChange?: (value: string) => void
  icon?: React.FC<{ size: string }>
  label?: string
  error?: string
  additionalItems?: React.ReactNode
  belowInputContent?: React.ReactNode
  placeholder?: string
  isDisabled?: boolean
  onClick?: (value: string) => void
  type?: InputType
  variant?: InputVariant
  overlay?: React.ReactNode
  autoFocus?: boolean
  testId?: string
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
}

const InputField = (props: Props): React.ReactElement => {
  const {
    value,
    onChange,
    icon: Icon,
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
    autoFocus,
    testId = 'input-field',
    onPaste
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (isDisabled) {
      return
    }
    onChange?.(e.target.value)
  }

  const handleClick = (): void => {
    inputRef.current?.focus()
    onClick?.(value || '')

    if (!isDisabled) {
      setIsFocused(true)
    }
  }

  const getStyedWrapperByVariant = (): typeof DefaultInputWrapper | typeof OutlineInputWrapper => {
    if (variant === 'outline') {
      return OutlineInputWrapper
    }
    return DefaultInputWrapper
  }

  const StyledWrapper = getStyedWrapperByVariant()

  return (
    <StyledWrapper onClick={handleClick}>
      <InsideWrapper>
        {Icon && (
          <IconWrapper>
            <Icon size="24" />
          </IconWrapper>
        )}

        <MainWrapper>
          <Label>{label}</Label>

          <InputAreaWrapper>
            <Input
              data-testid={testId}
              ref={inputRef}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              readOnly={isDisabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              type={type}
              hasOverlay={!!overlay && !isFocused}
              autoFocus={autoFocus}
              isDisabled={isDisabled}
              onPaste={onPaste}
            />

            {!isFocused && <InputOverlay>{overlay}</InputOverlay>}
          </InputAreaWrapper>

          {!!error?.length && (
            <NoticeWrapper>
              <NoticeText text={error} type="error" />
            </NoticeWrapper>
          )}
        </MainWrapper>

        {!!additionalItems && (
          <AdditionalItems onMouseDown={(e) => e.stopPropagation()}>
            {additionalItems}
          </AdditionalItems>
        )}
      </InsideWrapper>
      {!!belowInputContent && belowInputContent}
    </StyledWrapper>
  )
}

export { InputField }
