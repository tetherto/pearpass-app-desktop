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
import { InputFieldNote } from '../../../../components/InputFieldNote'
import { RecordTypeMenu } from '../../../../components/RecordTypeMenu'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useCreateOrEditRecord } from '../../../../hooks/useCreateOrEditRecord'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import {
  ButtonLittle,
  ButtonRoundIcon,
  ButtonSingleInput,
  DeleteIcon,
  ImageIcon,
  InputField,
  PasswordField,
  PasswordIcon,
  SaveIcon
} from '../../../../lib-react-components'
import { WifiIcon } from '../../../../lib-react-components/icons/WifiIcon'
import { getFilteredAttachmentsById } from '../../../../utils/getFilteredAttachmentsById'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { AttachmentField } from '../../../AttachmentField'
import { CustomFields } from '../../../CustomFields'
import { ModalContent } from '../../ModalContent'
import { DropdownsWrapper } from '../../styles'
import { UploadFilesModalContent } from '../../UploadImageModalContent'

/**
 * @param {{
 *   initialRecord: {
 *    data: {
 *     title: string
 *     password: string
 *     note: string
 *     customFields: {
 *        type: string
 *        name: string
 *      }[]
 *    attachments: { id: string, name: string}[]
 *     }
 *    }
 *  selectedFolder?: string
 *  onTypeChange: (type: string) => void
 * }} props
 */
export const CreateOrEditWifiModalContent = ({
  initialRecord,
  selectedFolder,
  onTypeChange
}) => {
  const { i18n } = useLingui()
  const { closeModal, setModal } = useModal()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const { setToast } = useToast()

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      closeModal()

      setToast({
        message: i18n._('Record created successfully')
      })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      closeModal()

      setToast({
        message: i18n._('Record updated successfully')
      })
    }
  })
  const onError = (error) => {
    setToast({
      message: error.message
    })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string().required(i18n._('Title is required')),
    password: Validator.string().required(i18n._('Password is required')),
    note: Validator.string(),
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
      title: initialRecord?.data?.title ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
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
      type: RECORD_TYPES.WIFI_PASSWORD,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        password: values.password,
        note: values.note,
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
            <${ButtonLittle} startIcon=${ImageIcon} onClick=${handleFileLoad}>
              ${i18n._('Load file')}
            <//>
            <${ButtonLittle} startIcon=${SaveIcon} type="submit">
              ${i18n._('Save')}
            <//>
          `}
        >
          <${DropdownsWrapper}>
            <${FolderDropdown}
              selectedFolder=${values?.folder}
              onFolderSelect=${(folder) => setValue('folder', folder?.name)}
            />

            ${!initialRecord &&
            html` <${RecordTypeMenu}
              selectedRecord=${RECORD_TYPES.WIFI_PASSWORD}
              onRecordSelect=${(record) => onTypeChange(record?.type)}
            />`}
          <//>
        <//>
      `}
    >
      <${FormWrapper}>
        <${FormGroup}>
          <${InputField}
            icon=${WifiIcon}
            label=${i18n._('Wi-Fi Name')}
            placeholder=${i18n._('Insert Wi-Fi Name')}
            variant="outline"
            ...${register('title')}
          />
        <//>
        <${FormGroup}>
          <${PasswordField}
            icon=${PasswordIcon}
            label=${i18n._('Wi-Fi Password')}
            placeholder=${i18n._('Insert Wi-Fi Password')}
            variant="outline"
            additionalItems=${html`
              <${ButtonRoundIcon}
                startIcon=${PasswordIcon}
                onClick=${() =>
                  handleCreateOrEditRecord({
                    recordType: 'password',
                    setValue: (value) => setValue('password', value)
                  })}
              />
            `}
            ...${register('password')}
          />
        <//>

        <${FormGroup}>
          <${InputFieldNote} ...${register('note')} />
        <//>

        ${values.attachments.length > 0 &&
        html`
          <${FormGroup}>
            ${values.attachments.map(
              (attachment) =>
                html`<${AttachmentField}
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
            onCreateCustom=${(type) => addItem({ type: type, name: type })}
          />
        <//>
      <//>
    <//>
  `
}
