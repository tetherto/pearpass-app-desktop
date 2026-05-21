import { html } from 'htm/react'

import { CreateOrEditCategoryWrapper } from '../containers/Modal/CreateOrEditCategoryWrapper'
import { GeneratePasswordModalContent } from '../containers/Modal/GeneratePasswordModalContent/GeneratePasswordModalContent'
import { useModal } from '../context/ModalContext'

export const useCreateOrEditRecord = () => {
  const { setModal } = useModal()

  const getModalContentByRecordType = ({
    recordType,
    initialRecord,
    selectedFolder,
    isFavorite
  }) => html`
    <${CreateOrEditCategoryWrapper}
      recordType=${recordType}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
    />
  `

  const getGeneratePasswordV2Content = ({ setValue }) => html`
    <${GeneratePasswordModalContent} onPasswordInsert=${setValue} />
  `

  /**
   * @param {{
   *   recordType: string,
   *   initialRecord?: unknown,
   *   selectedFolder?: string,
   *   isFavorite?: boolean,
   *   setValue?: (value: string, type: import('../shared/types').PassType) => void
   * }} options
   */
  const handleCreateOrEditRecord = (options) => {
    const { recordType, initialRecord, selectedFolder, isFavorite, setValue } =
      options

    if (recordType === 'password') {
      setModal(getGeneratePasswordV2Content({ setValue }))
      return
    }

    setModal(
      getModalContentByRecordType({
        recordType,
        initialRecord,
        selectedFolder,
        isFavorite
      })
    )
  }

  return {
    handleCreateOrEditRecord
  }
}
