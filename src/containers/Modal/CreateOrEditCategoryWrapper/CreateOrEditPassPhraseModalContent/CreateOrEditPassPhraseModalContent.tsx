import React from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { VALID_WORD_COUNTS } from '@tetherto/pearpass-lib-constants'
import {
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
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './CreateOrEditPassPhraseModalContent.styles'
import { PassPhrase } from '../../../PassPhrase/PassPhrase'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { FolderDropdown } from '../../../../components/FolderDropdown/FolderDropdown'

export type CreateOrEditPassPhraseModalContentProps = {
  initialRecord?: {
    data: {
      title: string
      passPhrase: string
      note: string
      customFields: { type: string; name: string }[]
      [key: string]: unknown
    }
    folder?: string
    isFavorite?: boolean
    [key: string]: unknown
  }
  selectedFolder?: string
  isFavorite?: boolean
  onTypeChange: (type: string) => void
}

const parsePassphraseText = (text: string): string[] =>
  text
    .trim()
    .split(/[-\s]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

export const CreateOrEditPassPhraseModalContent = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditPassPhraseModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
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
    passPhrase: Validator.string().required(t('Recovery phrase is required')),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string()
      })
    ),
    folder: Validator.string()
  })

  const { register, handleSubmit, registerArray, setValue, values } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder
    },
    validate: (formValues: Record<string, unknown>) => {
      const validationErrors =
        (schema.validate(formValues) as Record<string, string | undefined>) ?? {}
      const wordCount = parsePassphraseText(
        (formValues.passPhrase as string) ?? ''
      ).length

      if (!wordCount) {
        validationErrors.passPhrase = t('Recovery phrase is required')
      } else if (!VALID_WORD_COUNTS.includes(wordCount)) {
        validationErrors.passPhrase = t('Recovery phrase must contain 12 or 24 words')
      }

      return validationErrors
    }
  })

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  const onSubmit = (formValues: Record<string, unknown>) => {
    const data = {
      type: RECORD_TYPES.PASS_PHRASE,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        passPhrase: formValues.passPhrase,
        note: formValues.note,
        customFields: (
          (formValues.customFields as Array<{ type: string; note?: string }>) ??
          []
        ).filter((f) => f.note?.trim().length)
      }
    }

    if (initialRecord) {
      updateRecords([{ ...initialRecord, ...data }], onError)
    } else {
      createRecord(data, onError)
    }
  }

  const isEdit = !!initialRecord

  const titleField = register('title')
  const noteField = register('note')
  const passPhraseField = register('passPhrase')

  return (
    <Dialog
      title={isEdit ? t('Edit Recovery Phrase Item') : t('New Recovery Phrase Item')}
      onClose={closeModal}
      testID="createoredit-passphrase-dialog"
      closeButtonTestID="createoredit-passphrase-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-passphrase-button-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isLoading || (!isEdit && (!values.title?.trim() || !values.passPhrase?.trim()))}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-passphrase-button-save"
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createoredit-passphrase-form"
      >
        <InputField
          label={t('Title')}
          placeholder={t('Enter Title')}
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID="createoredit-passphrase-input-title"
        />

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Details')}
          </Text>
        </div>

        <PassPhrase
          isCreateOrEdit
          value={passPhraseField.value}
          onChange={(val) => setValue('passPhrase', val)}
          error={passPhraseField.error || undefined}
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

        <MultiSlotInput testID="createoredit-passphrase-comments-slot">
          <InputField
            label={t('Comment')}
            placeholder={t('Enter Comment')}
            value={noteField.value}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID="createoredit-passphrase-input-comment"
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID="createoredit-passphrase-hiddenmessage-slot"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addCustomField({ type: 'note', note: '' })}
              data-testid="createoredit-passphrase-button-addhiddenmessage"
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
                testID={`createoredit-passphrase-input-hiddenmessage-${index}`}
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
                      data-testid={`createoredit-passphrase-button-removehiddenmessage-${index}`}
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
