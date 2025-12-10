import { html } from 'htm/react'

import { AcceptedTypes, Container, Title } from './styles'
import { UploadFilesModalContent } from '../../containers/Modal/UploadImageModalContent'
import { useModal } from '../../context/ModalContext'

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string[]} props.accepts
 * @param {React.ElementType} props.icon
 * * @param {(files: FileList) => void} [props.onFilesSelected]
 */
export const ImportDataOption = ({
  title,
  accepts,
  icon,
  imgSrc,
  onFilesSelected
}) => {
  const { setModal } = useModal()

  const handleClick = () => {
    setModal(
      html`<${UploadFilesModalContent}
        type=${'file'}
        accepts=${accepts.join(',')}
        onFilesSelected=${onFilesSelected}
      />`
    )
  }

  return html` <${Container} onClick=${handleClick}>
    ${icon
      ? html`<${icon} size="25" />`
      : html`<img src=${imgSrc} width="25" height="25" />`}
    <${Title}>${title}<//>
    <${AcceptedTypes}>${accepts.join(', ')}<//>
  <//>`
}
