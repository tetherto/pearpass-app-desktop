import { html } from 'htm/react'

import {
  AdditionalItems,
  AttachmentName,
  IconWrapper,
  InputAreaWrapper,
  Label,
  MainWrapper,
  Wrapper
} from './styles'
import { useModal } from '../../context/ModalContext'
import { CommonFileIcon } from '../../lib-react-components'
import { DisplayPictureModalContent } from '../Modal/DisplayPictureModalContent'

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

const getExtension = (filename) => filename?.split('.').pop()?.toLowerCase()

export const AttachmentField = ({ attachment, label, additionalItems }) => {
  const { setModal } = useModal()

  const isImage = attachment?.name
    ? imageExtensions.includes(getExtension(attachment.name))
    : false

  const handleDownload = (e) => {
    e.stopPropagation()

    if (!attachment?.buffer || !attachment?.name) {
      return
    }

    const blob = new Blob([attachment.buffer])
    const url = URL.createObjectURL(blob)

    if (isImage) {
      setModal(
        html`<${DisplayPictureModalContent}
          url=${url}
          name=${attachment.name}
        />`
      )
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return html`
    <${Wrapper}>
      <${IconWrapper}> <${CommonFileIcon} size="21" /> <//>
      <${MainWrapper}>
        <${Label}> ${label} <//>

        <${InputAreaWrapper}>
          <${AttachmentName} href="#" onClick=${handleDownload}>
            ${attachment.name}
          <//>
        <//>
      <//>

      ${!!additionalItems &&
      html`
        <${AdditionalItems} onMouseDown=${(e) => e.stopPropagation()}>
          ${additionalItems}
        <//>
      `}
    <//>
  `
}
