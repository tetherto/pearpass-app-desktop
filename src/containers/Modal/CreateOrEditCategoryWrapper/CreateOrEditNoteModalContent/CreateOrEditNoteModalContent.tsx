import React from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  AttachmentField as UiKitAttachmentField,
  Button,
  Dialog,
  Form,
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { useCreateRecord, useRecords } from '@tetherto/pearpass-lib-vault'
import {
  Add,
  TrashOutlined,
  UploadFileFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { html } from 'htm/react'

import { createStyles } from './CreateOrEditNoteModalContent.styles'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import { getFilteredAttachmentsById } from '../../../../utils/getFilteredAttachmentsById'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { UploadFilesModalContent } from '../../UploadFilesModalContent'
import { FolderDropdown } from '../../../../components/FolderDropdown/FolderDropdown'

export type CreateOrEditNoteModalContentProps = {
  initialRecord?: {
    data: {
      title: string
      note: string
      customFields: { type: string; name: string }[]
      attachments: { id: string; name: string }[]
      [key: string]: unknown
    }
    folder?: string
    isFavorite?: boolean
    attachments?: { id: string; name: string }[]
    [key: string]: unknown
  }
  selectedFolder?: string
  isFavorite?: boolean
  onTypeChange: (type: string) => void
}

export const CreateOrEditNoteModalContent = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditNoteModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal, setModal } = useModal()
  const { setToast } = useToast()
  const { theme } = useTheme()
  const styles = createStyles()

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      closeModal()
      setToast({ message: t('Record created successfully') })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      closeModal()
      setToast({ message: t('Record updated successfully') })
    }
  })

  const onError = (error: { message: string }) => {
    setToast({ message: error.message })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string().required(t('Title is required')),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string()
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
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

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

  const onSubmit = (formValues: Record<string, unknown>) => {
    const data = {
      type: RECORD_TYPES.NOTE,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        note: formValues.note,
        customFields: (
          (formValues.customFields as Array<{ type: string; note?: string }>) ??
          []
        ).filter((f) => f.note?.trim().length),
        attachments: formValues.attachments
      }
    }

    if (initialRecord) {
      updateRecords([{ ...initialRecord, ...data }], onError)
    } else {
      createRecord(data, onError)
    }
  }

  const handleFileLoad = () => {
    setModal(
      html`<${UploadFilesModalContent}
        type=${'file'}
        onFilesSelected=${(files: File[]) =>
          handleFileSelect({
            files: files as unknown as FileList,
            fieldName: ATTACHMENTS_FIELD_KEY,
            setValue,
            values
          })}
      />`
    )
  }

  const isEdit = !!initialRecord

  const titleField = register('title')
  const noteField = register('note')

  return (
    <Dialog
      title={isEdit ? t('Edit Note Item') : t('New Note Item')}
      onClose={closeModal}
      testID="createoredit-note-dialog"
      closeButtonTestID="createoredit-note-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-note-button-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isLoading || (!isEdit && !values.title?.trim())}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-note-button-save"
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createoredit-note-form"
      >
        <InputField
          label={t('Title')}
          placeholder={t('Enter Title')}
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID="createoredit-note-input-title"
        />

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Details')}
          </Text>
        </div>

        <InputField
          label={t('Note')}
          placeholder={t('Enter Note')}
          value={noteField.value}
          onChange={(e) => noteField.onChange(e.target.value)}
          error={noteField.error || undefined}
          testID="createoredit-note-input-note"
        />

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>
        </div>

        <FolderDropdown
          selectedFolder={values?.folder}
          onFolderSelect={(name) =>
            setValue('folder', name === values.folder ? '' : name)
          }
        />

        <MultiSlotInput
          testID="createoredit-note-attachments-slot"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={handleFileLoad}
              data-testid="createoredit-note-button-addattachment"
            >
              {t('Add Another Attachment')}
            </Button>
          }
        >
          {values.attachments.length > 0
            ? values.attachments.map(
              (
                attachment: {
                  id?: string
                  tempId?: string
                  name: string
                },
                index: number
              ) => (
                <UiKitAttachmentField
                  key={attachment.id || attachment.tempId}
                  label={t('Attachment')}
                  value={attachment.name}
                  testID={`createoredit-note-attachment-${index}`}
                  rightSlot={
                    <Button
                      variant="tertiary"
                      size="small"
                      type="button"
                      aria-label={t('Delete File')}
                      iconBefore={
                        <TrashOutlined
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() =>
                        setValue(
                          ATTACHMENTS_FIELD_KEY,
                          getFilteredAttachmentsById(
                            values.attachments,
                            attachment
                          )
                        )
                      }
                      data-testid={`createoredit-note-button-deleteattachment-${index}`}
                    />
                  }
                />
              )
            )
            : null}
          <UiKitAttachmentField
            label={t('Attachment')}
            placeholder={t('Add or Drop File / Photos')}
            onClick={handleFileLoad}
            testID="createoredit-note-attachment-upload"
            rightSlot={
              <UploadFileFilled
                width={16}
                height={16}
                color={theme.colors.colorTextPrimary}
              />
            }
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID="createoredit-note-hiddenmessage-slot"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addCustomField({ type: 'note', note: '' })}
              data-testid="createoredit-note-button-addhiddenmessage"
            >
              {t('Add Another Message')}
            </Button>
          }
        >
          {customFieldsList.map((field: { id: string }, index: number) => {
            const fieldReg = registerCustomFieldItem('note', index)
            const canRemove = customFieldsList.length > 1
            return (
              <PasswordField
                key={field.id}
                label={t('Hidden Message')}
                placeholder={t('Enter Hidden Message')}
                value={fieldReg.value}
                onChange={(e) => fieldReg.onChange(e.target.value)}
                error={fieldReg.error || undefined}
                testID={`createoredit-note-input-hiddenmessage-${index}`}
                rightSlot={
                  canRemove ? (
                    <Button
                      variant="tertiary"
                      size="small"
                      type="button"
                      aria-label={t('Remove')}
                      iconBefore={
                        <TrashOutlined
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() => removeCustomFieldItem(index)}
                      data-testid={`createoredit-note-button-removehiddenmessage-${index}`}
                    />
                  ) : undefined
                }
              />
            )
          })}
        </MultiSlotInput>
      </Form>
    </Dialog>
  )
}
