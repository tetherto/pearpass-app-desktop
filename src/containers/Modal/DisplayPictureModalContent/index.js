import { html } from 'htm/react'

import { useModal } from '../../../context/ModalContext'
import { ModalContent } from '../ModalContent'
import { Content, HeaderContainer, Name } from './styles'

export const DisplayPictureModalContent = ({ url, name }) => {
  const { closeModal } = useModal()

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html`
        <${HeaderContainer}>
          <${Name}>${name}<//>
        <//>
      `}
    >
      <${Content}>
        <img src=${url} alt=${name} />
      <//>
    <//>
  `
}
