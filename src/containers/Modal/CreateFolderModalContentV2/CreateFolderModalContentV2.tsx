import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { Button, Dialog, Form, InputField } from '@tetherto/pearpass-lib-ui-kit'
import { useCreateFolder, useFolders } from '@tetherto/pearpass-lib-vault'
import { createStyles } from './CreateFolderModalContentV2.styles'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useTranslation } from '../../../hooks/useTranslation'

export interface CreateFolderModalContentV2Props {
  onClose: () => void
  onCreate?: (folderName: string) => void
  onRename?: (newFolderName: string, previousFolderName: string) => void
  initialValues?: { title: string }
}

export const CreateFolderModalContentV2 = ({
  onClose,
  onCreate,
  onRename,
  initialValues
}: CreateFolderModalContentV2Props) => {
  const { t } = useTranslation()
  const styles = createStyles()

  const isRename = !!initialValues

  const { renameFolder, data } = useFolders()
  const customFolders = Object.values(data?.customFolders ?? {})

  const [isRenameLoading, setIsRenameLoading] = useState(false)

  const { isLoading: isCreateLoading, createFolder } = useCreateFolder({
    onCompleted: (folderData: { folder: string }) => {
      onCreate?.(folderData.folder)
      onClose()
    }
  })

  const isLoading = isRename ? isRenameLoading : isCreateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string()
      .required(t('Title is required'))
      .refine((value: string) => {
        if (isRename && value === initialValues?.title) {
          return null
        }

        const isDuplicate = (customFolders as { name: string }[]).some(
          (folder: { name: string }) => folder.name === value
        )

        if (isDuplicate) {
          return t('Folder already exists')
        }

        return null
      })
  })

  const { register, handleSubmit, values } = useForm({
    initialValues: {
      title: initialValues?.title ?? ''
    },
    validate: (formValues: { title: string }) => schema.validate(formValues)
  })

  const onSubmit = async (formValues: { title: string }) => {
    if (isLoading) return

    if (isRename) {
      try {
        setIsRenameLoading(true)
        await renameFolder(initialValues.title, formValues.title)
        onRename?.(formValues.title, initialValues.title)
        onClose()
      } finally {
        setIsRenameLoading(false)
      }
    } else {
      createFolder(formValues.title)
    }
  }

  const isSaveDisabled = !values?.title?.trim() || isLoading

  const titleField = register('title')

  return (
    <Dialog
      title={isRename ? t('Rename Folder') : t('Create New Folder')}
      onClose={onClose}
      testID="createfolder-dialog-v2"
      closeButtonTestID="createfolder-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={onClose}
            data-testid="createfolder-discard-v2"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isSaveDisabled}
            isLoading={isLoading}
            onClick={handleSubmit(onSubmit)}
            data-testid="createfolder-save-v2"
          >
            {isRename ? t('Save') : t('Create New Folder')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createfolder-form-v2"
      >
        <InputField
          label={t('Folder Name')}
          placeholder={t('Enter Name')}
          value={titleField.value ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            titleField.onChange(e.target.value)
          }
          error={titleField.error || undefined}
          testID="createfolder-name-v2"
        />
      </Form>
    </Dialog>
  )
}
