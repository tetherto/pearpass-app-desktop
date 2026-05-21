import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  AttachmentField,
  InputField,
  MultiSlotInput,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useModal } from '../../../context/ModalContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { useTranslation } from '../../../hooks/useTranslation'
import { DisplayPictureModalContent } from '../../Modal/DisplayPictureModalContent/DisplayPictureModalContent'
import { createStyles } from './CreditCardDetailsForm.styles'
import { toReadOnlyFieldProps } from './utils'

type Attachment = {
  id?: string
  tempId?: string
  name: string
  buffer?: ArrayBuffer | Uint8Array
}

type CustomField = {
  type: string
  name?: string
  note?: string
}

type CreditCardRecord = {
  id: string
  folder?: string
  attachments?: Attachment[]
  data: {
    title?: string
    name?: string
    number?: string
    expireDate?: string
    securityCode?: string
    pinCode?: string
    note?: string
    customFields?: CustomField[]
  }
}

type CreditCardDetailsFormProps = {
  initialRecord?: CreditCardRecord
  selectedFolder?: string
}

type CreditCardDetailsFormValues = {
  name: string
  number: string
  expireDate: string
  securityCode: string
  pinCode: string
  note: string
  customFields: CustomField[]
  folder?: string
  attachments: Attachment[]
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

const getExtension = (filename?: string) =>
  filename?.split('.').pop()?.toLowerCase() ?? ''

export const CreditCardDetailsForm = ({
  initialRecord,
  selectedFolder
}: CreditCardDetailsFormProps) => {
  const { t } = useTranslation()
  const styles = createStyles()
  const { setModal } = useModal()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<CreditCardDetailsFormValues>(
    () => ({
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values, setValue } = useForm({ initialValues })

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasName = !!values.name?.length
  const hasNumber = !!values.number?.length
  const hasExpireDate = !!values.expireDate?.length
  const hasSecurityCode = !!values.securityCode?.length
  const hasPinCode = !!values.pinCode?.length
  const hasNote = !!values.note?.length
  const hasCustomFields = !!values.customFields?.length
  const hasAttachments = !!values.attachments?.length

  const handleAttachmentPress = (attachment: Attachment) => {
    if (!attachment?.buffer || !attachment?.name) return

    const blob = new Blob([attachment.buffer as BlobPart])
    const url = URL.createObjectURL(blob)
    const isImage = IMAGE_EXTENSIONS.includes(getExtension(attachment.name))

    if (isImage) {
      setModal(
        html`<${DisplayPictureModalContent}
          url=${url}
          name=${attachment.name}
        />`
      )
      return
    }

    const a = document.createElement('a')
    a.href = url
    a.download = attachment.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      {(hasName ||
        hasNumber ||
        hasExpireDate ||
        hasSecurityCode ||
        hasPinCode) && (
        <MultiSlotInput testID="card-details-multi-slot-input">
          {hasName && (
            <InputField
              label={t('Cardholder Name')}
              placeholder={t('John Smith')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-0"
              {...toReadOnlyFieldProps(register('name'))}
            />
          )}

          {hasNumber && (
            <InputField
              label={t('Card Number')}
              placeholder={t('1234 1234 1234 1234')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-1"
              {...toReadOnlyFieldProps(register('number'))}
            />
          )}

          {hasExpireDate && (
            <InputField
              label={t('Expiration Date')}
              placeholder={t('MM YY')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-2"
              {...toReadOnlyFieldProps(register('expireDate'))}
            />
          )}

          {hasSecurityCode && (
            <PasswordField
              label={t('Security Code')}
              placeholder={t('123')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-3"
              {...toReadOnlyFieldProps(register('securityCode'))}
            />
          )}

          {hasPinCode && (
            <PasswordField
              label={t('PIN')}
              placeholder={t('1234')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-4"
              {...toReadOnlyFieldProps(register('pinCode'))}
            />
          )}
        </MultiSlotInput>
      )}

      {hasAttachments && (
        <MultiSlotInput testID="attachments-multi-slot-input">
          {(values.attachments as Attachment[]).map((attachment, index) => (
            <AttachmentField
              key={attachment?.id || attachment?.tempId || attachment.name}
              label={t('Attachment')}
              value={attachment?.name ?? ''}
              isGrouped
              testID={`attachment-field-${index}`}
              onClick={() => handleAttachmentPress(attachment)}
            />
          ))}
        </MultiSlotInput>
      )}

      {hasNote && (
        <MultiSlotInput testID="comments-multi-slot-input">
          <InputField
            label={t('Comment')}
            placeholder={t('Add comment')}
            readOnly
            copyable
            onCopy={copyToClipboard}
            isGrouped
            testID="comments-multi-slot-input-slot-0"
            {...toReadOnlyFieldProps(register('note'))}
          />
        </MultiSlotInput>
      )}

      {hasCustomFields && (
        <MultiSlotInput testID="hidden-messages-multi-slot-input">
          {(values.customFields as CustomField[]).map((field, index) => (
            <PasswordField
              key={`${field.type}-${index}`}
              label={t('Hidden Message')}
              value={field.note ?? ''}
              placeholder={t('Enter Hidden Message')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID={`hidden-messages-multi-slot-input-slot-${index}`}
            />
          ))}
        </MultiSlotInput>
      )}
    </div>
  )
}
