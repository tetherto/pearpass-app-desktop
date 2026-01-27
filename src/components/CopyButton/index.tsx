import React from 'react'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useToast } from '../../context/ToastContext'
import { useLingui } from '@lingui/react'
import {
  CopyIcon,
} from '../../lib-react-components'




interface CopyButtonProps {
  value?: string
  testId?: string
}

const CopyButton = ({ value, testId }: CopyButtonProps): React.ReactElement => {

  const { i18n } = useLingui()

  const { setToast } = useToast()

  const { copyToClipboard, isCopyToClipboardDisabled } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: i18n._('Copied to clipboard'),
        icon: CopyIcon
      })
    }
  })

  const handleCopy = () => {
    if (value) {
      copyToClipboard(value)
    }
  }

  console.log("copybutton", {
    isCopyToClipboardDisabled,

  })

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
