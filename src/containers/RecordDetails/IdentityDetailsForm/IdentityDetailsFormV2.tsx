import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { DATE_FORMAT } from '@tetherto/pearpass-lib-constants'
import {
  AttachmentField,
  InputField,
  MultiSlotInput,
  PasswordField,
  Text
} from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useModal } from '../../../context/ModalContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { useTranslation } from '../../../hooks/useTranslation'
import { DisplayPictureModalContentV2 } from '../../Modal/DisplayPictureModalContentV2/DisplayPictureModalContentV2'
import { createStyles } from './IdentityDetailsFormV2.styles'
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

type IdentityRecord = {
  id: string
  folder?: string
  attachments?: Attachment[]
  data: {
    title?: string
    fullName?: string
    email?: string
    phoneNumber?: string
    address?: string
    zip?: string
    city?: string
    region?: string
    country?: string
    note?: string
    customFields?: CustomField[]
    passportFullName?: string
    passportNumber?: string
    passportIssuingCountry?: string
    passportDateOfIssue?: string
    passportExpiryDate?: string
    passportNationality?: string
    passportDob?: string
    passportGender?: string
    passportPicture?: Attachment[]
    idCardNumber?: string
    idCardDateOfIssue?: string
    idCardExpiryDate?: string
    idCardIssuingCountry?: string
    idCardPicture?: Attachment[]
    drivingLicenseNumber?: string
    drivingLicenseDateOfIssue?: string
    drivingLicenseExpiryDate?: string
    drivingLicenseIssuingCountry?: string
    drivingLicensePicture?: Attachment[]
  }
}

type FileFieldName =
  | 'attachments'
  | 'passportPicture'
  | 'idCardPicture'
  | 'drivingLicensePicture'

type AttachmentSource = {
  attachment: Attachment
  fieldName: FileFieldName
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

const getExtension = (filename?: string) =>
  filename?.split('.').pop()?.toLowerCase() ?? ''

const getAttachmentKey = (
  attachment: Pick<Attachment, 'id' | 'name'>,
  fieldName: FileFieldName,
  index: number
) => {
  if (attachment.id) return `id:${attachment.id}`
  if (attachment.name) return `name:${attachment.name}`
  return `${fieldName}:${index}`
}

const buildIdentityAttachmentSources = (values: {
  attachments?: Attachment[]
  passportPicture?: Attachment[]
  idCardPicture?: Attachment[]
  drivingLicensePicture?: Attachment[]
}): AttachmentSource[] => {
  const sources: AttachmentSource[] = []
  const indexByKey = new Map<string, number>()
  const groups: Array<{ fieldName: FileFieldName; items: Attachment[] }> = [
    { fieldName: 'attachments', items: values.attachments ?? [] },
    { fieldName: 'passportPicture', items: values.passportPicture ?? [] },
    { fieldName: 'idCardPicture', items: values.idCardPicture ?? [] },
    { fieldName: 'drivingLicensePicture', items: values.drivingLicensePicture ?? [] }
  ]

  groups.forEach(({ fieldName, items }) => {
    items.forEach((attachment, index) => {
      const key = getAttachmentKey(attachment, fieldName, index)
      const existing = indexByKey.get(key)
      if (existing === undefined) {
        indexByKey.set(key, sources.length)
        sources.push({ attachment, fieldName })
        return
      }
      const prev = sources[existing]
      if (!prev.attachment.buffer && attachment.buffer) {
        sources[existing] = {
          ...prev,
          attachment: { ...prev.attachment, ...attachment }
        }
      }
    })
  })

  return sources
}

type IdentityDetailsFormV2Props = {
  initialRecord?: IdentityRecord
  selectedFolder?: string
}

type IdentityDetailsFormValues = {
  fullName: string
  email: string
  phoneNumber: string
  address: string
  zip: string
  city: string
  region: string
  country: string
  note: string
  customFields: CustomField[]
  folder?: string
  passportFullName: string
  passportNumber: string
  passportIssuingCountry: string
  passportDateOfIssue: string
  passportExpiryDate: string
  passportNationality: string
  passportDob: string
  passportGender: string
  passportPicture: Attachment[]
  idCardNumber: string
  idCardDateOfIssue: string
  idCardExpiryDate: string
  idCardIssuingCountry: string
  idCardPicture: Attachment[]
  drivingLicenseNumber: string
  drivingLicenseDateOfIssue: string
  drivingLicenseExpiryDate: string
  drivingLicenseIssuingCountry: string
  drivingLicensePicture: Attachment[]
  attachments: Attachment[]
}

export const IdentityDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: IdentityDetailsFormV2Props) => {
  const { t } = useTranslation()
  const styles = createStyles()
  const { setModal } = useModal()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<IdentityDetailsFormValues>(
    () => ({
      fullName: initialRecord?.data?.fullName ?? '',
      email: initialRecord?.data?.email ?? '',
      phoneNumber: initialRecord?.data?.phoneNumber ?? '',
      address: initialRecord?.data?.address ?? '',
      zip: initialRecord?.data?.zip ?? '',
      city: initialRecord?.data?.city ?? '',
      region: initialRecord?.data?.region ?? '',
      country: initialRecord?.data?.country ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      passportFullName: initialRecord?.data?.passportFullName ?? '',
      passportNumber: initialRecord?.data?.passportNumber ?? '',
      passportIssuingCountry: initialRecord?.data?.passportIssuingCountry ?? '',
      passportDateOfIssue: initialRecord?.data?.passportDateOfIssue ?? '',
      passportExpiryDate: initialRecord?.data?.passportExpiryDate ?? '',
      passportNationality: initialRecord?.data?.passportNationality ?? '',
      passportDob: initialRecord?.data?.passportDob ?? '',
      passportGender: initialRecord?.data?.passportGender ?? '',
      passportPicture: initialRecord?.data?.passportPicture ?? [],
      idCardNumber: initialRecord?.data?.idCardNumber ?? '',
      idCardDateOfIssue: initialRecord?.data?.idCardDateOfIssue ?? '',
      idCardExpiryDate: initialRecord?.data?.idCardExpiryDate ?? '',
      idCardIssuingCountry: initialRecord?.data?.idCardIssuingCountry ?? '',
      idCardPicture: initialRecord?.data?.idCardPicture ?? [],
      drivingLicenseNumber: initialRecord?.data?.drivingLicenseNumber ?? '',
      drivingLicenseDateOfIssue:
        initialRecord?.data?.drivingLicenseDateOfIssue ?? '',
      drivingLicenseExpiryDate:
        initialRecord?.data?.drivingLicenseExpiryDate ?? '',
      drivingLicenseIssuingCountry:
        initialRecord?.data?.drivingLicenseIssuingCountry ?? '',
      drivingLicensePicture: initialRecord?.data?.drivingLicensePicture ?? [],
      attachments: initialRecord?.attachments ?? []
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values, setValue } = useForm({ initialValues })

  useGetMultipleFiles({
    fieldNames: [
      ATTACHMENTS_FIELD_KEY,
      'passportPicture',
      'idCardPicture',
      'drivingLicensePicture'
    ],
    updateValues: setValue,
    initialRecord
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasPersonalInformation =
    !!values.fullName?.length ||
    !!values.email?.length ||
    !!values.phoneNumber?.length

  const hasAddress =
    !!values.address?.length ||
    !!values.zip?.length ||
    !!values.city?.length ||
    !!values.region?.length ||
    !!values.country?.length

  const hasPassport =
    !!values.passportFullName?.length ||
    !!values.passportNumber?.length ||
    !!values.passportIssuingCountry?.length ||
    !!values.passportDateOfIssue?.length ||
    !!values.passportExpiryDate?.length ||
    !!values.passportNationality?.length ||
    !!values.passportDob?.length ||
    !!values.passportGender?.length

  const hasIdCard =
    !!values.idCardNumber?.length ||
    !!values.idCardDateOfIssue?.length ||
    !!values.idCardExpiryDate?.length ||
    !!values.idCardIssuingCountry?.length

  const hasDrivingLicense =
    !!values.drivingLicenseNumber?.length ||
    !!values.drivingLicenseDateOfIssue?.length ||
    !!values.drivingLicenseExpiryDate?.length ||
    !!values.drivingLicenseIssuingCountry?.length

  const attachmentSources = useMemo(
    () =>
      buildIdentityAttachmentSources({
        attachments: values.attachments,
        passportPicture: values.passportPicture,
        idCardPicture: values.idCardPicture,
        drivingLicensePicture: values.drivingLicensePicture
      }),
    [
      values.attachments,
      values.passportPicture,
      values.idCardPicture,
      values.drivingLicensePicture
    ]
  )
  const hasAttachments = attachmentSources.length > 0

  const hasNote = !!values.note?.length
  const hasCustomFields = !!values.customFields?.length

  const handleAttachmentPress = (attachment: Attachment) => {
    if (!attachment?.buffer || !attachment?.name) return

    const blob = new Blob([attachment.buffer as BlobPart])
    const url = URL.createObjectURL(blob)
    const isImage = IMAGE_EXTENSIONS.includes(getExtension(attachment.name))

    if (isImage) {
      setModal(
        html`<${DisplayPictureModalContentV2}
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
      {hasPersonalInformation && (
        <div style={styles.section}>
          <Text variant="caption">{t('Personal Information')}</Text>

          <MultiSlotInput testID="personal-information-multi-slot-input">
            {!!values.fullName?.length && (
              <InputField
                label={t('Full Name')}
                placeholder={t('John Smith')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="personal-information-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('fullName'))}
              />
            )}

            {!!values.email?.length && (
              <InputField
                label={t('Email')}
                placeholder={t('Insert email')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="personal-information-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('email'))}
              />
            )}

            {!!values.phoneNumber?.length && (
              <InputField
                label={t('Phone Number')}
                placeholder={t('Insert phone number')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="personal-information-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('phoneNumber'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasAddress && (
        <div style={styles.section}>
          <Text variant="caption">{t('Address')}</Text>

          <MultiSlotInput testID="address-multi-slot-input">
            {!!values.address?.length && (
              <InputField
                label={t('Address')}
                placeholder={t('Insert address')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('address'))}
              />
            )}

            {!!values.zip?.length && (
              <InputField
                label={t('ZIP')}
                placeholder={t('Insert ZIP')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('zip'))}
              />
            )}

            {!!values.city?.length && (
              <InputField
                label={t('City')}
                placeholder={t('Insert city')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('city'))}
              />
            )}

            {!!values.region?.length && (
              <InputField
                label={t('Region')}
                placeholder={t('Insert region')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(register('region'))}
              />
            )}

            {!!values.country?.length && (
              <InputField
                label={t('Country')}
                placeholder={t('Insert country')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-4"
                {...toReadOnlyFieldProps(register('country'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasPassport && (
        <div style={styles.section}>
          <Text variant="caption">{t('Passport')}</Text>

          <MultiSlotInput testID="passport-multi-slot-input">
            {!!values.passportFullName?.length && (
              <InputField
                label={t('Full Name')}
                placeholder={t('John Smith')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('passportFullName'))}
              />
            )}

            {!!values.passportNumber?.length && (
              <InputField
                label={t('Passport Number')}
                placeholder={t('Insert numbers')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('passportNumber'))}
              />
            )}

            {!!values.passportIssuingCountry?.length && (
              <InputField
                label={t('Issuing Country')}
                placeholder={t('Insert country')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('passportIssuingCountry'))}
              />
            )}

            {!!values.passportDateOfIssue?.length && (
              <InputField
                label={t('Date of Issue')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(register('passportDateOfIssue'))}
              />
            )}

            {!!values.passportExpiryDate?.length && (
              <InputField
                label={t('Expiry Date')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-4"
                {...toReadOnlyFieldProps(register('passportExpiryDate'))}
              />
            )}

            {!!values.passportNationality?.length && (
              <InputField
                label={t('Nationality')}
                placeholder={t('Insert your nationality')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-5"
                {...toReadOnlyFieldProps(register('passportNationality'))}
              />
            )}

            {!!values.passportDob?.length && (
              <InputField
                label={t('Date of Birth')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-6"
                {...toReadOnlyFieldProps(register('passportDob'))}
              />
            )}

            {!!values.passportGender?.length && (
              <InputField
                label={t('Gender')}
                placeholder={t('M/F')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-7"
                {...toReadOnlyFieldProps(register('passportGender'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasIdCard && (
        <div style={styles.section}>
          <Text variant="caption">{t('Identity Card')}</Text>

          <MultiSlotInput testID="identity-card-multi-slot-input">
            {!!values.idCardNumber?.length && (
              <InputField
                label={t('ID Number')}
                placeholder={t('123456789')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('idCardNumber'))}
              />
            )}

            {!!values.idCardDateOfIssue?.length && (
              <InputField
                label={t('Creation Date')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('idCardDateOfIssue'))}
              />
            )}

            {!!values.idCardExpiryDate?.length && (
              <InputField
                label={t('Expiry Date')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('idCardExpiryDate'))}
              />
            )}

            {!!values.idCardIssuingCountry?.length && (
              <InputField
                label={t('Issuing Country')}
                placeholder={t('Insert country')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(register('idCardIssuingCountry'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasDrivingLicense && (
        <div style={styles.section}>
          <Text variant="caption">{t('Driving License')}</Text>

          <MultiSlotInput testID="driving-license-multi-slot-input">
            {!!values.drivingLicenseNumber?.length && (
              <InputField
                label={t('ID Number')}
                placeholder={t('123456789')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('drivingLicenseNumber'))}
              />
            )}

            {!!values.drivingLicenseDateOfIssue?.length && (
              <InputField
                label={t('Creation Date')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('drivingLicenseDateOfIssue'))}
              />
            )}

            {!!values.drivingLicenseExpiryDate?.length && (
              <InputField
                label={t('Expiry Date')}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('drivingLicenseExpiryDate'))}
              />
            )}

            {!!values.drivingLicenseIssuingCountry?.length && (
              <InputField
                label={t('Issuing Country')}
                placeholder={t('Insert country')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(
                  register('drivingLicenseIssuingCountry')
                )}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasAttachments && (
        <div style={styles.section}>
          <Text variant="caption">{t('Attachments')}</Text>

          <MultiSlotInput testID="attachments-multi-slot-input">
            {attachmentSources.map(({ attachment }, index) => (
              <AttachmentField
                key={
                  attachment?.id ||
                  attachment?.tempId ||
                  attachment.name ||
                  `attachment-${index}`
                }
                label={t('Attachment')}
                value={attachment?.name ?? ''}
                isGrouped
                testID={`attachment-field-${index}`}
                onClick={() => handleAttachmentPress(attachment)}
              />
            ))}
          </MultiSlotInput>
        </div>
      )}
      {(hasNote || hasCustomFields) && (
        <div style={styles.section}>
          <Text variant="caption">{t('Additional')}</Text>

          {hasNote && (
            <MultiSlotInput testID="comments-multi-slot-input">
              <InputField
                label={t('Comment')}
                placeholder={t('Enter Comment')}
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
      )}
    </div>
  )
}
