import React from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  AttachmentField as UiKitAttachmentField,
  Button,
  DateField,
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

import { createStyles } from './CreateOrEditCreditCardModalContent.styles'
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

export type CreateOrEditCreditCardModalContentProps = {
  initialRecord?: {
    data: {
      title: string
      name: string
      number: string
      expireDate: string
      securityCode: string
      pinCode: string
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

const formatCardNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits
}

const formatExpireDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} ${digits.slice(2)}` : digits
}

export const CreateOrEditCreditCardModalContent = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditCreditCardModalContentProps) => {
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
    name: Validator.string(),
    number: Validator.string(),
    expireDate: Validator.string(),
    securityCode: Validator.string().numeric(t('Should contain only numbers')),
    pinCode: Validator.string().numeric(t('Should contain only numbers')),
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
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', name: 'note', note: '' }],
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
      type: RECORD_TYPES.CREDIT_CARD,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        name: formValues.name,
        number: formValues.number,
        expireDate: formValues.expireDate,
        securityCode: formValues.securityCode,
        pinCode: formValues.pinCode,
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
  const nameField = register('name')
  const securityCodeField = register('securityCode')
  const pinCodeField = register('pinCode')
  const noteField = register('note')

  return (
    <Dialog
      title={isEdit ? t('Edit Credit Card Item') : t('New Credit Card Item')}
      onClose={closeModal}
      testID="createoredit-creditcard-dialog"
      closeButtonTestID="createoredit-creditcard-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-creditcard-button-discard"
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
            data-testid="createoredit-creditcard-button-save"
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createoredit-creditcard-form"
      >
        <InputField
          label={t('Title')}
          placeholder={t('Enter Title')}
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID="createoredit-creditcard-input-title"
        />

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Details')}
          </Text>
        </div>

        <MultiSlotInput testID="createoredit-creditcard-details-slot">
          <InputField
            label={t('Cardholder Name')}
            placeholder={t('Enter Name')}
            value={nameField.value}
            onChange={(e) => nameField.onChange(e.target.value)}
            error={nameField.error || undefined}
            testID="createoredit-creditcard-input-name"
          />
          <InputField
            label={t('Card Number')}
            placeholder={t('Enter Card Number')}
            value={values.number}
            onChange={(e) => setValue('number', formatCardNumber(e.target.value))}
            testID="createoredit-creditcard-input-number"
          />
          <DateField
            label={t('Expiration Date')}
            placeholder={t('Enter Expiration Date')}
            value={values.expireDate}
            onChange={(e) => setValue('expireDate', formatExpireDate(e.target.value))}
            pickerMode="month-year"
            testID="createoredit-creditcard-input-expiredate"
          />
          <PasswordField
            label={t('Security Code')}
            placeholder={t('Enter Security Code')}
            value={securityCodeField.value}
            onChange={(e) =>
              securityCodeField.onChange(e.target.value.replace(/\D/g, ''))
            }
            error={securityCodeField.error || undefined}
            testID="createoredit-creditcard-input-securitycode"
          />
          <PasswordField
            label={t('PIN')}
            placeholder={t('Enter PIN')}
            value={pinCodeField.value}
            onChange={(e) =>
              pinCodeField.onChange(e.target.value.replace(/\D/g, ''))
            }
            error={pinCodeField.error || undefined}
            testID="createoredit-creditcard-input-pincode"
          />
        </MultiSlotInput>

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

        <MultiSlotInput testID="createoredit-creditcard-comment-slot">
          <InputField
            label={t('Comment')}
            placeholder={t('Enter Comment')}
            value={noteField.value}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID="createoredit-creditcard-input-comment"
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID="createoredit-creditcard-attachments-slot"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={handleFileLoad}
              data-testid="createoredit-creditcard-button-addattachment"
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
                  testID={`createoredit-creditcard-attachment-${index}`}
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
                      data-testid={`createoredit-creditcard-button-deleteattachment-${index}`}
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
            testID="createoredit-creditcard-attachment-upload"
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
          testID="createoredit-creditcard-hiddenmessage-slot"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addCustomField({ type: 'note', name: 'note' })}
              data-testid="createoredit-creditcard-button-addhiddenmessage"
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
                testID={`createoredit-creditcard-input-hiddenmessage-${index}`}
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
                      data-testid={`createoredit-creditcard-button-removehiddenmessage-${index}`}
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
