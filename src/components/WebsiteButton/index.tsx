import React from 'react'
import { OutsideLinkIcon } from '../../lib-react-components/icons/OutsideLinkIcon'

interface WebsiteButtonProps {
  url?: string
  testId?: string
}

const WebsiteButton = ({ url, testId }: WebsiteButtonProps): React.ReactElement => {
  const handleWebsiteClick = () => {
    if (!url?.length) {
      return
    }

    window.open(url, '_blank')
  }

  return (
    <div
      onClick={handleWebsiteClick}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      data-testid={testId}
    >
      <OutsideLinkIcon size="24" />
    </div>
  )
}

export { WebsiteButton }
