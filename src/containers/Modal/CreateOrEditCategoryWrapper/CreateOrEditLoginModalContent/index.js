import React from 'react'

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
  CompoundField,
  DeleteIcon,
  ImageIcon,
  InputField,
  KeyIcon,
  PasswordField,
  PasswordIcon,
  PlusIcon,
  SaveIcon,
  UserIcon,
  WorldIcon
} from '../../../../lib-react-components'
import { addHttps } from '../../../../utils/addHttps'
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
 *    username: string
 *    password: string
 *    note: string
 *    websites: string[]
 *    customFields: {
 *        type: string
 *        name: string
 *     }[]
 *    attachments: { id: string, name: string}[]
 *    }
 *  }
 *  selectedFolder?: string
 *  onTypeChange: (type: string) => void
 * }} props
 */
export const CreateOrEditLoginModalContent = ({
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
    username: Validator.string(),
    password: Validator.string(),
    note: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website('Wrong format of website')
      })
    ),
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
    ),
    passwordUpdatedAt: Validator.number()
  })

  const { register, handleSubmit, registerArray, values, setValue } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord?.data?.websites.map((website) => ({ website }))
        : [{ name: 'website' }],
      customFields: initialRecord?.data.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    },
    validate: (values) => schema.validate(values)
  })

  const {
    value: websitesList,
    addItem,
    registerItem,
    removeItem
  } = registerArray('websites')

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.LOGIN,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        username: values.username,
        password: values.password,
        note: values.note,
        websites: values.websites
          .filter((website) => !!website?.website?.trim().length)
          .map((website) => addHttps(website.website)),
        customFields: values.customFields,
        attachments: values.attachments,
        passwordUpdatedAt: initialRecord?.data?.passwordUpdatedAt
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

  const handleRecordTypeChange = (type) => {
    onTypeChange(type)
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
      onClose=${closeModal}
      onSubmit=${handleSubmit(onSubmit)}
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
              selectedRecord=${RECORD_TYPES.LOGIN}
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

        <${FormGroup}>
          <${InputField}
            testId="createoredit-input-username"
            label=${i18n._('Email or username')}
            placeholder=${i18n._('Email or username')}
            variant="outline"
            icon=${UserIcon}
            ...${register('username')}
          />

          <${PasswordField}
            testId="createoredit-input-password"
            label=${i18n._('Password')}
            placeholder=${i18n._('Password')}
            variant="outline"
            icon=${KeyIcon}
            hasStrongness
            additionalItems=${html`
              <${ButtonRoundIcon}
                testId="createoredit-button-generatepassword"
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

        <${CompoundField}>
          ${websitesList.map(
            (website, index) => html`
              <${React.Fragment} key=${website.id}>
                <${InputField}
                  testId="createoredit-input-website"
                  label=${i18n._('Website')}
                  placeholder=${i18n._('https://')}
                  icon=${WorldIcon}
                  ...${registerItem('website', index)}
                  additionalItems=${index === 0
                    ? html`
                        <${ButtonSingleInput}
                          testId="createoredit-button-addwebsite"
                          startIcon=${PlusIcon}
                          onClick=${() => addItem({ name: 'website' })}
                        >
                          ${i18n._('Add website')}
                        <//>
                      `
                    : html`
                        <${ButtonSingleInput}
                          testId="createoredit-button-removewebsite"
                          startIcon=${DeleteIcon}
                          onClick=${() => removeItem(index)}
                        >
                          ${i18n._('Remove website')}
                        <//>
                      `}
                />
              <//>
            `
          )}
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
                      testId="createoredit-button-deleteattachment"
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
          <${InputFieldNote}
            testId="createoredit-input-note"
            ...${register('note')}
          />
        <//>

        <${CustomFields}
          customFields=${customFieldsList}
          register=${registerCustomFieldItem}
          removeItem=${removeCustomFieldItem}
        />

        <${FormGroup}>
          <${CreateCustomField}
            testId="createoredit-createcustomfield"
            onCreateCustom=${(type) =>
              addCustomField({ type: type, name: type })}
          />
        <//>
      <//>
    <//>
  `
}
