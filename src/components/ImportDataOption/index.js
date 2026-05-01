import { html } from 'htm/react'

import { AcceptedTypes, Container, Title } from './styles'
import { UploadFilesModalContent } from '../../containers/Modal/UploadImageModalContent'
import { useModal } from '../../context/ModalContext'

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string[]} props.accepts
 * * @param {(files: FileList) => void} [props.onFilesSelected]
 */
export const ImportDataOption = ({
  title,
  accepts,
  onFilesSelected,
  testId
}) => {
  const { setModal } = useModal()

  const handleClick = () => {
    setModal(
      html`<${UploadFilesModalContent}
        type=${'file'}
        closeOnChange=${false}
        accepts=${accepts.join(',')}
        onFilesSelected=${onFilesSelected}
      />`
    )
  }

  return html` <${Container} data-testid=${testId} onClick=${handleClick}>
    <${Title}>${title}<//>
    <${AcceptedTypes}>${accepts.join(', ')}<//>
  <//>`
}
