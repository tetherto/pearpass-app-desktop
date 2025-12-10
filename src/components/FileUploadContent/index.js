import { useRef, useState } from 'react'

import { html } from 'htm/react'
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from 'pearpass-lib-constants'

import { ContentWrapper, FileSizeWarning, HiddenInput } from './styles'
import { useTranslation } from '../../hooks/useTranslation'
import { ButtonSecondary } from '../../lib-react-components'
import { YellowErrorIcon } from '../../lib-react-components'
import { FileDropArea } from '../FileDropArea'

export const FileUploadContent = ({
  accepts,
  isTypeImage,
  handleFileChange
}) => {
  const { t } = useTranslation()
  const [isFileSizeWarning, setIsFileSizeWarning] = useState(false)
  const fileInputRef = useRef(null)

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (files) => {
    const file = files?.[0]

    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setIsFileSizeWarning(true)
      return
    }

    if (isFileSizeWarning) {
      setIsFileSizeWarning(false)
    }

    handleFileChange(files)
  }

  return html` <${ContentWrapper}>
      <${FileDropArea}
        onFileDrop=${onFileChange}
        accepts=${accepts}
        label=${isTypeImage
          ? t('Drop picture here...')
          : t('Drop file here...')}
      />
    <//>

    ${isFileSizeWarning
      ? html` <${FileSizeWarning}>
          <${YellowErrorIcon} size="18" />
          ${t(
            `Your picture is too large. Please upload one that’s ${MAX_FILE_SIZE_MB} MB or smaller.`
          )}
        <//>`
      : html`<${FileSizeWarning}>
          ${t(`Maximum file size: ${MAX_FILE_SIZE_MB} MB.`)}
        <//>`}

    <${ButtonSecondary} onClick=${handleBrowseClick}>
      ${t('Browse folders')}
    <//>

    <${HiddenInput}
      ref=${fileInputRef}
      type="file"
      accept=${accepts}
      onChange=${(event) => onFileChange(event?.target?.files)}
    />`
}
