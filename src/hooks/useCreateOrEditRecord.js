import { html } from 'htm/react'

import { CreateOrEditCategoryWrapper } from '../containers/Modal/CreateOrEditCategoryWrapper'
import { GeneratePasswordSideDrawerContent } from '../containers/Modal/GeneratePasswordSideDrawerContent'
import { useModal } from '../context/ModalContext'

/**
 * @returns {{
 *  handleCreateOrEditRecord: ({
 *    recordType: 'login' | 'creditCard' | 'identity' | 'note' | 'custom',
 *    initialRecord?: any,
 *    selectedFolder?: string,
 *    isFavorite?: boolean
 *  }) => void
 * }}
 */
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

  const handleCreateOrEditRecord = ({
    recordType,
    initialRecord,
    selectedFolder,
    isFavorite,
    setValue
  }) => {
    if (recordType === 'password') {
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
