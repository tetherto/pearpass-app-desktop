import React from 'react'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useToast } from '../../context/ToastContext'
import { CopyIcon } from '../../lib-react-components'
import { useTranslation } from '../../hooks/useTranslation'

interface CopyButtonProps {
  value?: string
  testId?: string
  text?: string
  color?: string
}

const CopyButton = ({
  value,
  testId,
  text,
  color
}: CopyButtonProps): React.ReactElement => {
  const { t } = useTranslation()
  const { setToast } = useToast()

  const { copyToClipboard, isCopyToClipboardDisabled } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t('Copied to clipboard'),
        icon: CopyIcon
      })
    }
  })

  const handleCopy = () => {
    if (value) {
      copyToClipboard(value)
    }
  }

  if (isCopyToClipboardDisabled) {
    return <></>
  }

  return (
    <div
      onClick={handleCopy}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: text ? '5px' : '0' // Add gap only if text is present
      }}
      data-testid={testId}
    >
      <CopyIcon size="24" color={color} />
      {text && (
        <span
          style={{
            color: color,
            fontFamily: 'Inter',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          {text}
        </span>
      )}
    </div>
  )
}

export { CopyButton }
