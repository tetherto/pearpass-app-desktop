import React from 'react'
import { InputField } from '../InputField'
import { CopyIcon } from '../../icons/CopyIcon'

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
  const handleCopyClick = () => {
    console.log('Copy icon clicked! Current value:', props.value)
  }

  return (
    <InputField
      {...props}
      additionalItems={
        <div
          onClick={handleCopyClick}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <CopyIcon size="24" />
        </div>
      }
    />
  )
}

export { InputFieldWithCopyIcon }
