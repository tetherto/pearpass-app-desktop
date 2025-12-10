import React from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { useCreateFolder, useFolders } from 'pearpass-lib-vault'

import { useModal } from '../../../context/ModalContext'
import { ModalContent } from '../ModalContent'
import { HeaderWrapper } from './styles'
import { useGlobalLoading } from '../../../context/LoadingContext'
import {
  InputField,
  ButtonLittle,
  SaveIcon
} from '../../../lib-react-components'

/**
 * @param {{
 *  onCreate: (folderName: string) => void
 *  initialValues: {title: string}
 * }} props
 */
export const CreateFolderModalContent = ({ onCreate, initialValues }) => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()
  const { renameFolder } = useFolders()

  const { isLoading, createFolder } = useCreateFolder({
    onCompleted: (folderName) => {
      onCreate?.(folderName)

      closeModal()
    }
  })

  useGlobalLoading({ isLoading })

  const { data } = useFolders()

  const customFolders = Object.values(data?.customFolders ?? {})

  const schema = Validator.object({
    title: Validator.string()
      .required(i18n._('Title is required'))
      .refine((value) => {
        const isDuplicate = customFolders.some(
          (folder) => folder.name === value
        )

        if (isDuplicate) {
          return i18n._('Folder already exists')
        }

        return null
      })
  })

  const { register, handleSubmit } = useForm({
    initialValues: {
      title: initialValues?.title ?? ''
    },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    if (initialValues) {
      await renameFolder(initialValues.title, values.title)
      closeModal()
    } else {
      createFolder(values.title)
    }
  }

  return html`
    <${React.Fragment}>
      <${ModalContent}
        onSubmit=${handleSubmit(onSubmit)}
        onClose=${closeModal}
        headerChildren=${html`
          <${HeaderWrapper}>
            <${ButtonLittle} startIcon=${SaveIcon} type="submit">
              ${!!initialValues ? i18n._('Save') : i18n._('Create folder')}
            <//>
          <//>
        `}
      >
        <${InputField}
          label=${i18n._('Title')}
          placeholder=${i18n._('Insert folder name')}
          variant="outline"
          autoFocus
          ...${register('title')}
        />
      <//>
    <//>
  `
}
