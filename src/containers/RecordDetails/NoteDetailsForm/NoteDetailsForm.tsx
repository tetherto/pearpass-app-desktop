import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  AttachmentField,
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useModal } from '../../../context/ModalContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { useTranslation } from '../../../hooks/useTranslation'
import { DisplayPictureModalContent } from '../../Modal/DisplayPictureModalContent/DisplayPictureModalContent'
import { createStyles } from './NoteDetailsForm.styles'
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

type NoteRecord = {
  id: string
  folder?: string
  attachments?: Attachment[]
  data: {
    title?: string
    note?: string
    customFields?: CustomField[]
  }
}

type NoteDetailsFormProps = {
  initialRecord?: NoteRecord
  selectedFolder?: string
}

type NoteDetailsFormValues = {
  note: string
  customFields: CustomField[]
  folder?: string
  attachments: Attachment[]
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

const getExtension = (filename?: string) =>
  filename?.split('.').pop()?.toLowerCase() ?? ''

export const NoteDetailsForm = ({
  initialRecord,
  selectedFolder
}: NoteDetailsFormProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles()
  const { setModal } = useModal()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<NoteDetailsFormValues>(
    () => ({
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
      {hasNote && (
        <div style={styles.section}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Details')}
          </Text>

          <MultiSlotInput testID="note-multi-slot-input">
            <InputField
              label={t('Note')}
              placeholder={t('Enter Note')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="note-multi-slot-input-slot-0"
              {...toReadOnlyFieldProps(register('note'))}
            />
          </MultiSlotInput>
        </div>
      )}

      {(hasAttachments || hasCustomFields) && (
        <div style={styles.section}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>

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
      )}
    </div>
  )
}
