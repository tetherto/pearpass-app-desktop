import React from 'react'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useToast } from '../../context/ToastContext'
import {
  CopyIcon,
} from '../../lib-react-components'
import { useTranslation } from '../../hooks/useTranslation'

interface CopyButtonProps {
  value?: string
  testId?: string
}

const CopyButton = ({ value, testId }: CopyButtonProps): React.ReactElement => {
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
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      data-testid={testId}
    >
      <CopyIcon size="24" />
    </div>
  )
}

export { CopyButton }
