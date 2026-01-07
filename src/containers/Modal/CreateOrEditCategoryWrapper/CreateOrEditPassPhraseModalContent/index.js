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
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import {
  ButtonLittle,
  InputField,
  SaveIcon
} from '../../../../lib-react-components'
import { CubeIcon } from '../../../../lib-react-components/icons/CubeIcon'
import { CustomFields } from '../../../CustomFields'
import { PassPhrase } from '../../../PassPhrase'
import { ModalContent } from '../../ModalContent'
import { DropdownsWrapper } from '../../styles'

/**
 * @param {{
 *   initialRecord: {
 *    data: {
 *     title: string
 *     passPhrase: string
 *     note: string
 *     customFields: {
 *        type: string
 *        name: string
 *      }[]
 *     }
 *    }
 *  selectedFolder?: string
 *  onTypeChange: (type: string) => void
 * }} props
 */
export const CreateOrEditPassPhraseModalContent = ({
  initialRecord,
  selectedFolder,
  onTypeChange
}) => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()
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
    passPhrase: Validator.string().required(i18n._('PassPhrase is required')),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string().required(i18n._('Note is required'))
      })
    ),
    folder: Validator.string()
  })

  const { register, handleSubmit, registerArray, values, setValue } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    },
    validate: (values) => schema.validate(values)
  })

  const {
    value: list,
    addItem,
    registerItem,
    removeItem
  } = registerArray('customFields')

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.PASS_PHRASE,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        passPhrase: values.passPhrase,
        note: values.note,
        customFields: values.customFields
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

  return html`
    <${ModalContent}
      onSubmit=${handleSubmit(onSubmit)}
      onClose=${closeModal}
      headerChildren=${html`
        <${FormModalHeaderWrapper}
          buttons=${html`
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
              selectedRecord=${RECORD_TYPES.PASS_PHRASE}
              onRecordSelect=${(record) => onTypeChange(record?.type)}
            />`}
          <//>
        <//>
      `}
    >
      <${FormWrapper}>
        <${FormGroup}>
          <${InputField}
            testId="createoredit-input-title"
            icon=${CubeIcon}
            label=${i18n._('Application')}
            placeholder=${i18n._('Insert Application name')}
            variant="outline"
            ...${register('title')}
          />
        <//>
        <${FormGroup}>
          <${PassPhrase} isCreateOrEdit ...${register('passPhrase')} />
        <//>

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
