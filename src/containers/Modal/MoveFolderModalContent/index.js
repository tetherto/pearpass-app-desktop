import React from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useRecords, useFolders } from 'pearpass-lib-vault'

import { useModal } from '../../../context/ModalContext'
import { ModalContent } from '../ModalContent'
import { FolderList, HeaderWrapper } from './styles'
import { useGlobalLoading } from '../../../context/LoadingContext'
import {
  ButtonFolder,
  ButtonSingleInput,
  NewFolderIcon
} from '../../../lib-react-components'
import { CreateFolderModalContent } from '../CreateFolderModalContent'

/**
 * @param {{
 *  records: {
 *    id: string
 *    folder?: string
 *  }[]
 *  onCompleted?: () => void
 * }} props
 */
export const MoveFolderModalContent = ({ records, onCompleted }) => {
  const { i18n } = useLingui()
  const { closeModal, setModal } = useModal()

  const { updateFolder, isLoading: isUpdating } = useRecords({
    onCompleted: closeModal
  })
  const { data: folders, isLoading: isLoadingFolders } = useFolders()

  const isLoading = isUpdating || isLoadingFolders

  useGlobalLoading({ isLoading })

  const filteredFolders = React.useMemo(() => {
    const excludedFolder = records?.length === 1 ? records[0].folder : null
    const customFolders = Object.values(folders?.customFolders ?? {})

    return (
      customFolders.filter((folder) => folder.name !== excludedFolder) ?? []
    )
  }, [folders, records])

  const handleMove = async (folderName) => {
    const recordIds = records.map((record) => record.id)
    await updateFolder(recordIds, folderName)

    onCompleted?.()
  }

  const handleCreateClick = () => {
    setModal(html`
      <${CreateFolderModalContent}
        onCreate=${(folderData) => handleMove(folderData.folder)}
      />
    `)
  }

  return html`
    <${React.Fragment}>
      <${ModalContent}
        onClose=${closeModal}
        headerChildren=${html`
          <${HeaderWrapper}>
            ${i18n._('Select a folder or create a new folder')}
          <//>
        `}
      >
        <${FolderList}>
          ${filteredFolders.map(
            (folder) => html`
              <${ButtonFolder}
                key=${folder.name}
                onClick=${() => handleMove(folder.name)}
              >
                ${folder.name}
              <//>
            `
          )}
        <//>

        <${ButtonSingleInput}
          startIcon=${NewFolderIcon}
          onClick=${() => handleCreateClick()}
        >
          ${i18n._('Create new folder')}
        <//>
      <//>
    <//>
  `
}
