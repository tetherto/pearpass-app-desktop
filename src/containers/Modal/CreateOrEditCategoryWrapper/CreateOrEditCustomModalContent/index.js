import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { RECORD_TYPES, useCreateRecord, useRecords } from 'pearpass-lib-vault'

import { CreateCustomField } from '../../../../components/CreateCustomField'
import { FolderDropdown } from '../../../../components/FolderDropdown'
import { FormGroup } from '../../../../components/FormGroup'
import { FormModalHeaderWrapper } from '../../../../components/FormModalHeaderWrapper'
import { FormWrapper } from '../../../../components/FormWrapper'
import { RecordTypeMenu } from '../../../../components/RecordTypeMenu'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import {
  ButtonLittle,
  ButtonSingleInput,
  DeleteIcon,
  ImageIcon,
  InputField,
  SaveIcon
} from '../../../../lib-react-components'
import { getFilteredAttachmentsById } from '../../../../utils/getFilteredAttachmentsById'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { AttachmentField } from '../../../AttachmentField'
import { CustomFields } from '../../../CustomFields'
import { ModalContent } from '../../ModalContent'
import { DropdownsWrapper } from '../../styles'
import { UploadFilesModalContent } from '../../UploadImageModalContent'

/**
 * @param {{
 *  initialRecord: {
 *    data: {
 *      title: string
 *      customFields: {
 *          note: string
 *          type: string
 *     }[]
 *    attachments: { id: string, name: string}[]
 *   }
 *  }
 *  selectedFolder?: string
 *  onTypeChange: (type: string) => void
 * }} props
 * @returns
 */
export const CreateOrEditCustomModalContent = ({
  initialRecord,
  selectedFolder,
  onTypeChange
}) => {
  const { i18n } = useLingui()
  const { closeModal, setModal } = useModal()
  const { setToast } = useToast()

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      closeModal()

      setToast({
        message: i18n._('Record created successfully')
      })
    }
  })
  const onError = (error) => {
    setToast({
      message: error.message
    })
  }
  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      closeModal()

      setToast({
        message: i18n._('Record updated successfully')
      })
    }
  })

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string().required(i18n._('Title is required')),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string().required(i18n._('Note is required'))
      })
    ),
    folder: Validator.string(),
    attachments: Validator.array().items(
      Validator.object({
        id: Validator.string(),
        name: Validator.string().required()
      })
    )
  })

  const { register, handleSubmit, registerArray, values, setValue } = useForm({
    initialValues: {
      title: initialRecord?.data?.title || '',
      customFields: initialRecord?.data?.customFields || [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    },
    validate: (values) => schema.validate(values)
  })

  const {
    value: list,
    addItem,
    registerItem,
    removeItem
  } = registerArray('customFields')

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.CUSTOM,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        customFields: values.customFields,
        attachments: values.attachments
      }
    }

    if (initialRecord) {
      updateRecords(
        [
          {
            ...initialRecord,
            ...data
          }
        ],
        onError
      )
    } else {
      createRecord(data, onError)
    }
  }

  const handleRecordTypeChange = (item) => {
    onTypeChange(item)
  }

  const handleFileLoad = () => {
    setModal(
      html`<${UploadFilesModalContent}
        type=${'file'}
        onFilesSelected=${(files) =>
          handleFileSelect({
            files,
            fieldName: ATTACHMENTS_FIELD_KEY,
            setValue,
            values
          })}
      />`
    )
  }

  return html`
    <${ModalContent}
      onSubmit=${handleSubmit(onSubmit)}
      onClose=${closeModal}
      headerChildren=${html`
        <${FormModalHeaderWrapper}
          buttons=${html`
            <${ButtonLittle}
              testId="createoredit-button-loadfile"
              startIcon=${ImageIcon}
              onClick=${handleFileLoad}
            >
              ${i18n._('Load file')}
            <//>
            <${ButtonLittle}
              testId="createoredit-button-save"
              startIcon=${SaveIcon}
              type="submit"
            >
              ${i18n._('Save')}
            <//>
          `}
        >
          <${DropdownsWrapper}>
            <${FolderDropdown}
              testId="createoredit-dropdown-folder"
              selectedFolder=${values?.folder}
              onFolderSelect=${(folder) => setValue('folder', folder?.name)}
            />
            ${!initialRecord &&
            html` <${RecordTypeMenu}
              testId="createoredit-dropdown-recordtype"
              selectedRecord=${RECORD_TYPES.CUSTOM}
              onRecordSelect=${(record) => handleRecordTypeChange(record?.type)}
            />`}
          <//>
        <//>
      `}
    >
      <${FormWrapper}>
        <${FormGroup}>
          <${InputField}
            testId="createoredit-input-title"
            label=${i18n._('Title')}
            placeholder=${i18n._('Insert title')}
            variant="outline"
            ...${register('title')}
          />
        <//>

        ${values.attachments.length > 0 &&
        html`
          <${FormGroup}>
            ${values.attachments.map(
              (attachment) =>
                html`<${AttachmentField}
                  testId="createoredit-attachment"
                  key=${attachment.id || attachment.tempId}
                  attachment=${attachment}
                  label=${i18n._('File')}
                  additionalItems=${html`
                    <${ButtonSingleInput}
                      startIcon=${DeleteIcon}
                      onClick=${() =>
                        setValue(
                          ATTACHMENTS_FIELD_KEY,
                          getFilteredAttachmentsById(
                            values.attachments,
                            attachment
                          )
                        )}
                    >
                      ${i18n._('Delete File')}
                    <//>
                  `}
                />`
            )}
          <//>
        `}

        <${CustomFields}
          customFields=${list}
          register=${registerItem}
          removeItem=${removeItem}
        />

        <${FormGroup}>
          <${CreateCustomField}
            testId="createoredit-button-createcustomfield"
            onCreateCustom=${(type) => addItem({ type: type, name: type })}
          />
        <//>
      <//>
    <//>
  `
}
