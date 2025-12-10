import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { ContentWrapper, HeaderWrapper } from './styles'
import { FileUploadContent } from '../../../components/FileUploadContent'
import { useModal } from '../../../context/ModalContext'
import { CommonFileIcon, ImageIcon } from '../../../lib-react-components'
import { ModalContent } from '../ModalContent'

/**
 * @component
 * @param {Object} props
 * @param {'file'|'image'} props.type
 * @param {string} props.accepts
 * @returns {JSX.Element}
 */

export const UploadFilesModalContent = ({ accepts, type, onFilesSelected }) => {
  const isTypeImage = type === 'image'

  const { i18n } = useLingui()
  const { closeModal } = useModal()

  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      onFilesSelected?.(files)
    }
    closeModal()
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html`
        <${HeaderWrapper}>
          ${isTypeImage
            ? html` <${ImageIcon} size="21" />
                ${i18n._('Upload picture')}`
            : html`
                <${CommonFileIcon} size="21" />
                ${i18n._('Upload file')}
              `}
        <//>
      `}
    >
      <${ContentWrapper}>
        <${FileUploadContent}
          accepts=${accepts}
          isTypeImage=${isTypeImage}
          handleFileChange=${handleFileChange}
        />
      <//>
    <//>
  `
}
