import React from 'react'
import { InputField } from '../../lib-react-components/components/InputField'
import { CopyButton } from '../CopyButton'

interface Props {
  value?: string
  onChange?: (value: string) => void
  icon?: React.FC<{ size: string }>
  label?: string
  error?: string
  placeholder?: string
  isDisabled?: boolean
  onClick?: (value: string) => void
  type?: 'text' | 'password' | 'url'
  variant?: 'default' | 'outline'
  autoFocus?: boolean
  testId?: string
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
}

const InputFieldWithCopyIcon = (props: Props): React.ReactElement => {

  return (
    <InputField
      {...props}
      additionalItems={
        <CopyButton value={props.value} />
      }
    />
  )
}

export { InputFieldWithCopyIcon }
