import { html } from 'htm/react'

import { CreateOrEditCategoryWrapper } from '../containers/Modal/CreateOrEditCategoryWrapper'
import { GeneratePasswordModalContentV2 } from '../containers/Modal/GeneratePasswordModalContentV2/GeneratePasswordModalContentV2'
import { GeneratePasswordSideDrawerContent } from '../containers/Modal/GeneratePasswordSideDrawerContent'
import { useModal } from '../context/ModalContext'
import { isV2 } from '../utils/designVersion'

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

  const getSideDrawerContentByRecordType = ({ recordType, setValue }) => {
    if (recordType === 'password') {
      return html`<${GeneratePasswordSideDrawerContent}
        onPasswordInsert=${setValue}
      />`
    }
  }

  const getGeneratePasswordV2Content = ({ setValue }) => html`
    <${GeneratePasswordModalContentV2} onPasswordInsert=${setValue} />
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
      if (isV2()) {
        setModal(getGeneratePasswordV2Content({ setValue }))
        return
      }

      setModal(getSideDrawerContentByRecordType({ recordType, setValue }), {
        modalType: 'sideDrawer'
      })

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
