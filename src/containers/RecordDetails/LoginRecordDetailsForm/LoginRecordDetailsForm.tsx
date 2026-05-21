import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
// @ts-ignore - declaration file is missing
import { isBefore, subtractDateUnits } from '@tetherto/pear-apps-utils-date'
import {
  AlertMessage,
  AttachmentField,
  Button,
  InputField,
  MultiSlotInput,
  PasswordField,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { OpenInNew } from '@tetherto/pearpass-lib-ui-kit/icons'
import { html } from 'htm/react'

import { OtpCodeField } from '../../../components/OtpCodeField'
import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useModal } from '../../../context/ModalContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { addHttps } from '../../../utils/addHttps'
import { formatPasskeyDate } from '../../../utils/formatPasskeyDate'
import { isPasswordChangeReminderDisabled } from '../../../utils/isPasswordChangeReminderDisabled'
import { useTranslation } from '../../../hooks/useTranslation'
import { DisplayPictureModalContent } from '../../Modal/DisplayPictureModalContent/DisplayPictureModalContent'
import { createStyles } from './LoginRecordDetailsForm.styles'
import { toReadOnlyFieldProps } from './utils'

type Attachment = {
  id?: string
  tempId?: string
  name: string
  buffer?: ArrayBuffer | Uint8Array
}

type CustomField = {
  type: string
  name: string
  note?: string
}

type LoginRecord = {
  id: string
  folder?: string
  attachments?: Attachment[]
  otpPublic?: unknown
  data: {
    title?: string
    username?: string
    password?: string
    note?: string
    websites?: string[]
    customFields?: CustomField[]
    credential?: { id: string }
    passkeyCreatedAt?: number | string | Date | null
    passwordUpdatedAt?: number | string | Date
  }
}

type LoginRecordDetailsFormProps = {
  initialRecord?: LoginRecord
  selectedFolder?: string
}

type LoginRecordDetailsFormValues = {
  username: string
  password: string
  note: string
  websites: string[]
  customFields: CustomField[]
  folder?: string
  attachments: Attachment[]
  credential: string
  passkeyCreatedAt: number | string | Date | null
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

const getExtension = (filename?: string) =>
  filename?.split('.').pop()?.toLowerCase() ?? ''

export const LoginRecordDetailsForm = ({
  initialRecord,
  selectedFolder
}: LoginRecordDetailsFormProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles()
  const { setModal } = useModal()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<LoginRecordDetailsFormValues>(
    () => ({
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites ?? [],
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? [],
      credential: initialRecord?.data?.credential?.id ?? '',
      passkeyCreatedAt: initialRecord?.data?.passkeyCreatedAt ?? null
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values, setValue } = useForm({
    initialValues
  })

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasUsername = !!values.username?.length
  const hasPassword = !!values.password?.length
  const hasPasskey = !!values.credential
  const hasWebsites = !!values.websites?.length
  const hasNote = !!values.note?.length
  const hasCustomFields = !!values.customFields?.length
  const hasAttachments = !!values.attachments?.length

  const isPasswordSixMonthsOld = () => {
    const passwordUpdatedAt = initialRecord?.data?.passwordUpdatedAt
    return (
      !!passwordUpdatedAt &&
      isBefore(passwordUpdatedAt, subtractDateUnits(6, 'month'))
    )
  }

  const shouldShowSecurityWarning =
    !isPasswordChangeReminderDisabled() && isPasswordSixMonthsOld()

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
      <div style={styles.topContent}>
        {(hasUsername || hasPassword || !!initialRecord?.otpPublic) && (
          <MultiSlotInput testID="credentials-multi-slot-input">
            {hasUsername && (
              <InputField
                label={t('Email / Username')}
                placeholder={t('Email / Username')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="credentials-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('username'))}
              />
            )}

            {hasPassword && (
              <PasswordField
                label={t('Password')}
                placeholder={t('Password')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="credentials-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('password'))}
              />
            )}

            {!!initialRecord?.otpPublic && !!initialRecord?.id && (
              <OtpCodeField
                key={initialRecord.id}
                recordId={initialRecord.id}
                otpPublic={
                  initialRecord.otpPublic as Parameters<
                    typeof OtpCodeField
                  >[0]['otpPublic']
                }
                isGrouped
              />
            )}
          </MultiSlotInput>
        )}

        {hasWebsites &&
          values.websites.map((website: string, index: number) => (
            <MultiSlotInput
              key={`${website}-${index}`}
              testID={`website-multi-slot-input-${index}`}
            >
              <InputField
                label={t('Website')}
                value={website}
                placeholder={t('Enter Website')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID={`website-multi-slot-input-slot-${index}`}
                rightSlot={
                  website?.length ? (
                    <Button
                      variant="tertiary"
                      size="small"
                      aria-label={t('Open website')}
                      iconBefore={
                        <OpenInNew
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() =>
                        window.open(
                          addHttps(website) as unknown as string,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                    />
                  ) : undefined
                }
              />
            </MultiSlotInput>
          ))}

        {hasPasskey && (
          <InputField
            label={t('Passkey')}
            placeholder={t('Passkey')}
            value={
              formatPasskeyDate(values.passkeyCreatedAt) || t('Passkey Stored')
            }
            readOnly
            testID="passkey-input"
          />
        )}

        {hasAttachments && (
          <MultiSlotInput testID="attachments-multi-slot-input">
            {values.attachments.map((attachment: Attachment, index: number) => (
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
            {values.customFields.map((field: CustomField, index: number) => (
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

      {shouldShowSecurityWarning && (
        <AlertMessage
          variant="error"
          size="big"
          title={t('Password Warning')}
          description={t(
            "It's been 6 months since you last updated this password. Consider changing it to keep your account secure."
          )}
        />
      )}
    </div>
  )
}
