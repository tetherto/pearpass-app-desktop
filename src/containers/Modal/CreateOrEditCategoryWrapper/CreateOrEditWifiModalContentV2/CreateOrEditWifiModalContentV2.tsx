import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
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
  SyncLock,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './CreateOrEditWifiModalContentV2.styles'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { useCreateOrEditRecord } from '../../../../hooks/useCreateOrEditRecord'
import { PasswordFieldStrengthIndicator } from '../../../../components/PasswordFieldStrengthIndicator'
import { PassType } from '../../../../shared/types'
import { FolderDropdownV2 } from '../../../../components/FolderDropdown/FolderDropdownV2'

export type CreateOrEditWifiModalContentV2Props = {
  initialRecord?: {
    data: {
      title: string
      password: string
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

export const CreateOrEditWifiModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditWifiModalContentV2Props) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const [passwordType, setPasswordType] = useState<PassType>(PassType.Password)

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
    title: Validator.string().required(t('Name is required')),
    password: Validator.string().required(t('Password is required')),
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
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder
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

  const onSubmit = (formValues: Record<string, unknown>) => {
    const data = {
      type: RECORD_TYPES.WIFI_PASSWORD,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        password: formValues.password,
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
  const passwordField = register('password')
  const noteField = register('note')

  return (
    <Dialog
      title={isEdit ? t('Edit Wi-Fi Item') : t('New Wi-Fi Item')}
      onClose={closeModal}
      testID="createoredit-wifi-dialog-v2"
      closeButtonTestID="createoredit-wifi-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-wifi-button-discard-v2"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-wifi-button-save-v2"
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createoredit-wifi-form-v2"
      >
        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Credentials')}
          </Text>
        </div>

        <MultiSlotInput
          testID="createoredit-wifi-credentials-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<SyncLock width={16} height={16} />}
              onClick={() =>
                handleCreateOrEditRecord({
                  recordType: 'password',
                  setValue: (value: string, type: PassType) => {
                    setValue('password', value)
                    setPasswordType(type === PassType.PassPhrase ? PassType.PassPhrase : PassType.Password)
                  }
                })
              }
              data-testid="createoredit-wifi-button-generatepassword-v2"
            >
              {t('Generate Password')}
            </Button>
          }
        >
          <InputField
            label={t('Wi-Fi Name')}
            placeholder={t('Enter Name of Network')}
            value={titleField.value}
            onChange={(e) => titleField.onChange(e.target.value)}
            error={titleField.error || undefined}
            testID="createoredit-wifi-input-name-v2"
          />
          <PasswordFieldStrengthIndicator
            testID="createoredit-wifi-input-password-v2"
            passwordField={passwordField}
            passwordType={passwordType}
            setPasswordType={setPasswordType}
          />
        </MultiSlotInput>

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>
        </div>

        <FolderDropdownV2
          selectedFolder={values?.folder}
          onFolderSelect={(name) =>
            setValue('folder', name === values.folder ? '' : name)
          }
        />

        <InputField
          label={t('Comment')}
          placeholder={t('Enter Comment')}
          value={noteField.value}
          onChange={(e) => noteField.onChange(e.target.value)}
          error={noteField.error || undefined}
          testID="createoredit-wifi-input-comment-v2"
        />

        <MultiSlotInput
          testID="createoredit-wifi-hiddenmessage-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addCustomField({ type: 'note', note: '' })}
              data-testid="createoredit-wifi-button-addhiddenmessage-v2"
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
                testID={`createoredit-wifi-input-hiddenmessage-v2-${index}`}
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
                      data-testid={`createoredit-wifi-button-removehiddenmessage-v2-${index}`}
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
