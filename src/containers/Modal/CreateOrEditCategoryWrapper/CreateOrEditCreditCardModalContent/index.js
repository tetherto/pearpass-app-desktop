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
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import {
  ButtonLittle,
  ButtonSingleInput,
  CalendarIcon,
  CreditCardIcon,
  DeleteIcon,
  ImageIcon,
  InputField,
  NineDotsIcon,
  PasswordField,
  SaveIcon,
  UserIcon
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
 *   initialRecord: {
 *   data: {
 *    title: string
 *    name: string
 *    number: string
 *    expireDate: string
 *    securityCode: string
 *    pinCode: string
 *    note: string
 *    customFields: {
 *       type: string
 *       name: string
 *    }[]
 *    attachments: { id: string, name: string}[]
 *  }
 * }
 *  selectedFolder?: string
 *  onTypeChange: (type: string) => void
 * }} props
 */
export const CreateOrEditCreditCardModalContent = ({
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
    name: Validator.string(),
    number: Validator.string().numeric(
      i18n._('Number on card must be a number')
    ),
    expireDate: Validator.string(),
    securityCode: Validator.string().numeric(i18n._('Note must be a string')),
    pinCode: Validator.string().numeric(i18n._('Pin code must be a number')),
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
        name: Validator.string().required(),
        buffer: Validator.object({})
      })
    )
  })

  const { values, register, handleSubmit, registerArray, setValue } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    },
    validate: (values) => schema.validate(values)
  })

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  const {
    value: list,
    addItem,
    registerItem,
    removeItem
  } = registerArray('customFields')

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.CREDIT_CARD,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        name: values.name,
        number: values.number,
        expireDate: values.expireDate,
        securityCode: values.securityCode,
        pinCode: values.pinCode,
        note: values.note,
        customFields: values.customFields,
        attachments: values.attachments
      }
    }

    if (initialRecord) {
      updateRecords([{ ...initialRecord, ...data }], onError)
    } else {
      createRecord(data, onError)
    }
  }

  const handleRecordTypeChange = (item) => {
    onTypeChange(item)
  }

  const handleExpireDateChange = (inputValue) => {
    let value = inputValue.replace(/\D/g, '')

    if (value.length > 4) {
      value = value.slice(0, 4)
    }

    if (value.length > 2) {
      value = `${value.slice(0, 2)} ${value.slice(2)}`
    }

    setValue('expireDate', value)
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

  const handleNumericInputChange = (value, field) => {
    setValue(field, value.replace(/\D/g, ''))
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      onSubmit=${handleSubmit(onSubmit)}
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
              selectedRecord=${RECORD_TYPES.CREDIT_CARD}
              onRecordSelect=${(record) => handleRecordTypeChange(record?.type)}
            />`}
          <//>
        <//>
      `}
    >
      <${FormWrapper}>
        <${FormGroup}>
          <${InputField}
            label=${i18n._('Title')}
            placeholder=${i18n._('Insert title')}
            variant="outline"
            ...${register('title')}
          />
        <//>

        <${FormGroup}>
          <${InputField}
            label=${i18n._('Full name')}
            placeholder=${i18n._('Full name')}
            variant="outline"
            icon=${UserIcon}
            ...${register('name')}
          />

          <${InputField}
            label=${i18n._('Number on card')}
            placeholder="1234 1234 1234 1234 "
            variant="outline"
            icon=${CreditCardIcon}
            ...${register('number')}
            value=${values.number.replace(/(.{4})/g, '$1 ').trim()}
            onChange=${(value) => handleNumericInputChange(value, 'number')}
          />

          <${InputField}
            label=${i18n._('Date of expire')}
            placeholder="MM YY"
            variant="outline"
            icon=${CalendarIcon}
            value=${values.expireDate}
            onChange=${handleExpireDateChange}
          />

          <${PasswordField}
            label=${i18n._('Security code')}
            placeholder="123"
            variant="outline"
            icon=${CreditCardIcon}
            ...${register('securityCode')}
            onChange=${(value) =>
              handleNumericInputChange(value, 'securityCode')}
          />

          <${PasswordField}
            label=${i18n._('Pin code')}
            placeholder="1234"
            variant="outline"
            icon=${NineDotsIcon}
            ...${register('pinCode')}
            onChange=${(value) => handleNumericInputChange(value, 'pinCode')}
          />
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

        <${FormGroup}>
          <${InputFieldNote} ...${register('note')} />
        <//>

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
