import { useEffect, useMemo } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  AddContainer,
  Body,
  Container,
  DeleteIconWrapper,
  DeleteOverlay,
  Header,
  ImageContainer,
  Photo,
  Title
} from './styles'
import { useModal } from '../../context/ModalContext'
import { DeleteIcon, ImageIcon, PlusIcon } from '../../lib-react-components'
import { DisplayPictureModalContent } from '../Modal/DisplayPictureModalContent'

/**
 * @param {{
 *  title: string
 *  pictures: { buffer: ArrayBuffer, name: string }[]
 *  onAdd?: () => void
 *  onRemove?: (index: number) => void
 *  testId?: string
 * }} props
 */
export const ImagesField = ({
  title,
  pictures = [],
  onAdd,
  onRemove,
  testId
}) => {
  const { setModal } = useModal()

  const pictureUrls = useMemo(
    () =>
      pictures.map((picture) => ({
        url: URL.createObjectURL(new Blob([picture.buffer])),
        name: picture.name
      })),
    [pictures]
  )

  useEffect(
    () => () => {
      pictureUrls.forEach((p) => URL.revokeObjectURL(p.url))
    },
    [pictureUrls]
  )

  const handlePictureClick = (url, name) => {
    setModal(html`<${DisplayPictureModalContent} url=${url} name=${name} />`)
  }

  const handleRemove = (e, index) => {
    e.stopPropagation()
    onRemove?.(index)
  }

  return html`
    <${Container} data-testid=${testId}>
      <${Header}>
        <${ImageIcon} />
        <${Title}>${title}<//>
      <//>
      <${Body}>
        ${pictureUrls?.map(
          (picture, idx) => html`
            <${ImageContainer}
              onClick=${() => handlePictureClick(picture.url, picture.name)}
              key=${idx}
            >
              <${Photo} src=${picture.url} alt="attachment" />

              ${onRemove &&
              html`<${DeleteOverlay}>
                <${DeleteIconWrapper} onClick=${(e) => handleRemove(e, idx)}>
                  <${DeleteIcon} size="24" color=${colors.black.mode1} />
                <//>
              <//>`}
            <//>
          `
        )}
        ${!!onAdd &&
        html` <${AddContainer}
          data-testid=${testId ? `${testId}-add` : undefined}
          onClick=${onAdd}
        >
          <${PlusIcon} color=${colors.primary400.mode1} />
        <//>`}
      <//>
    <//>
  `
}
