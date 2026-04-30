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

import { createStyles } from './CreateOrEditIdentityModalContentV2.styles'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import { getFilteredAttachmentsById } from '../../../../utils/getFilteredAttachmentsById'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { UploadFilesModalContentV2 } from '../../UploadFilesModalContentV2'
import { FolderDropdownV2 } from '../../../../components/FolderDropdown/FolderDropdownV2'

type IdentityData = {
  title: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
  zip: string
  city: string
  region: string
  country: string
  note: string
  customFields: { type: string; note?: string }[]
  passportFullName: string
  passportNumber: string
  passportIssuingCountry: string
  passportDateOfIssue: string
  passportExpiryDate: string
  passportNationality: string
  passportDob: string
  passportGender: string
  idCardNumber: string
  idCardDateOfIssue: string
  idCardExpiryDate: string
  idCardIssuingCountry: string
  drivingLicenseNumber: string
  drivingLicenseDateOfIssue: string
  drivingLicenseExpiryDate: string
  drivingLicenseIssuingCountry: string
  attachments: { id: string; name: string }[]
}

export type CreateOrEditIdentityModalContentV2Props = {
  initialRecord?: {
    data: Partial<IdentityData> & Record<string, unknown>
    folder?: string
    isFavorite?: boolean
    attachments?: { id: string; name: string }[]
    [key: string]: unknown
  }
  selectedFolder?: string
  isFavorite?: boolean
  onTypeChange: (type: string) => void
}

export const CreateOrEditIdentityModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditIdentityModalContentV2Props) => {
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
    fullName: Validator.string(),
    email: Validator.string().email(t('Invalid email format')),
    phoneNumber: Validator.string(),
    address: Validator.string(),
    zip: Validator.string(),
    city: Validator.string(),
    region: Validator.string(),
    country: Validator.string(),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string()
      })
    ),
    folder: Validator.string(),
    passportFullName: Validator.string(),
    passportNumber: Validator.string(),
    passportIssuingCountry: Validator.string(),
    passportDateOfIssue: Validator.string(),
    passportExpiryDate: Validator.string(),
    passportNationality: Validator.string(),
    passportDob: Validator.string(),
    passportGender: Validator.string(),
    idCardNumber: Validator.string(),
    idCardDateOfIssue: Validator.string(),
    idCardExpiryDate: Validator.string(),
    idCardIssuingCountry: Validator.string(),
    drivingLicenseNumber: Validator.string(),
    drivingLicenseDateOfIssue: Validator.string(),
    drivingLicenseExpiryDate: Validator.string(),
    drivingLicenseIssuingCountry: Validator.string(),
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
      fullName: initialRecord?.data?.fullName ?? '',
      email: initialRecord?.data?.email ?? '',
      phoneNumber: initialRecord?.data?.phoneNumber ?? '',
      address: initialRecord?.data?.address ?? '',
      zip: initialRecord?.data?.zip ?? '',
      city: initialRecord?.data?.city ?? '',
      region: initialRecord?.data?.region ?? '',
      country: initialRecord?.data?.country ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder,
      passportFullName: initialRecord?.data?.passportFullName ?? '',
      passportNumber: initialRecord?.data?.passportNumber ?? '',
      passportIssuingCountry: initialRecord?.data?.passportIssuingCountry ?? '',
      passportDateOfIssue: initialRecord?.data?.passportDateOfIssue ?? '',
      passportExpiryDate: initialRecord?.data?.passportExpiryDate ?? '',
      passportNationality: initialRecord?.data?.passportNationality ?? '',
      passportDob: initialRecord?.data?.passportDob ?? '',
      passportGender: initialRecord?.data?.passportGender ?? '',
      idCardNumber: initialRecord?.data?.idCardNumber ?? '',
      idCardDateOfIssue: initialRecord?.data?.idCardDateOfIssue ?? '',
      idCardExpiryDate: initialRecord?.data?.idCardExpiryDate ?? '',
      idCardIssuingCountry: initialRecord?.data?.idCardIssuingCountry ?? '',
      drivingLicenseNumber: initialRecord?.data?.drivingLicenseNumber ?? '',
      drivingLicenseDateOfIssue:
        initialRecord?.data?.drivingLicenseDateOfIssue ?? '',
      drivingLicenseExpiryDate:
        initialRecord?.data?.drivingLicenseExpiryDate ?? '',
      drivingLicenseIssuingCountry:
        initialRecord?.data?.drivingLicenseIssuingCountry ?? '',
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
      type: RECORD_TYPES.IDENTITY,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        fullName: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        address: formValues.address,
        zip: formValues.zip,
        city: formValues.city,
        region: formValues.region,
        country: formValues.country,
        note: formValues.note,
        customFields: (
          (formValues.customFields as Array<{ type: string; note?: string }>) ??
          []
        ).filter((f) => f.note?.trim().length),
        passportFullName: formValues.passportFullName,
        passportNumber: formValues.passportNumber,
        passportIssuingCountry: formValues.passportIssuingCountry,
        passportDateOfIssue: formValues.passportDateOfIssue,
        passportExpiryDate: formValues.passportExpiryDate,
        passportNationality: formValues.passportNationality,
        passportDob: formValues.passportDob,
        passportGender: formValues.passportGender,
        idCardNumber: formValues.idCardNumber,
        idCardDateOfIssue: formValues.idCardDateOfIssue,
        idCardExpiryDate: formValues.idCardExpiryDate,
        idCardIssuingCountry: formValues.idCardIssuingCountry,
        drivingLicenseNumber: formValues.drivingLicenseNumber,
        drivingLicenseDateOfIssue: formValues.drivingLicenseDateOfIssue,
        drivingLicenseExpiryDate: formValues.drivingLicenseExpiryDate,
        drivingLicenseIssuingCountry: formValues.drivingLicenseIssuingCountry,
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
      html`<${UploadFilesModalContentV2}
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
  const fullNameField = register('fullName')
  const emailField = register('email')
  const phoneNumberField = register('phoneNumber')
  const addressField = register('address')
  const zipField = register('zip')
  const cityField = register('city')
  const regionField = register('region')
  const countryField = register('country')
  const noteField = register('note')
  const passportFullNameField = register('passportFullName')
  const passportNumberField = register('passportNumber')
  const passportIssuingCountryField = register('passportIssuingCountry')
  const passportNationalityField = register('passportNationality')
  const passportGenderField = register('passportGender')
  const idCardNumberField = register('idCardNumber')
  const idCardIssuingCountryField = register('idCardIssuingCountry')
  const drivingLicenseNumberField = register('drivingLicenseNumber')
  const drivingLicenseIssuingCountryField = register('drivingLicenseIssuingCountry')

  return (
    <Dialog
      title={isEdit ? t('Edit Identity Item') : t('New Identity Item')}
      onClose={closeModal}
      testID="createoredit-identity-dialog-v2"
      closeButtonTestID="createoredit-identity-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-identity-button-discard-v2"
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
            data-testid="createoredit-identity-button-save-v2"
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createoredit-identity-form-v2"
      >
        <InputField
          label={t('Title')}
          placeholder={t('Enter Title')}
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID="createoredit-identity-input-title-v2"
        />

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Personal Information')}
          </Text>
        </div>

        <MultiSlotInput testID="createoredit-identity-personal-slot-v2">
          <InputField
            label={t('Fullname')}
            placeholder={t('Enter Name')}
            value={fullNameField.value}
            onChange={(e) => fullNameField.onChange(e.target.value)}
            error={fullNameField.error || undefined}
            testID="createoredit-identity-input-fullname-v2"
          />
          <InputField
            label={t('Email')}
            placeholder={t('Enter Email Address')}
            value={emailField.value}
            onChange={(e) => emailField.onChange(e.target.value)}
            error={emailField.error || undefined}
            testID="createoredit-identity-input-email-v2"
          />
          <InputField
            label={t('Phone Number')}
            placeholder={t('Enter Phone Number')}
            value={phoneNumberField.value}
            onChange={(e) => phoneNumberField.onChange(e.target.value)}
            error={phoneNumberField.error || undefined}
            testID="createoredit-identity-input-phone-v2"
          />
        </MultiSlotInput>

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Address Details')}
          </Text>
        </div>

        <MultiSlotInput testID="createoredit-identity-address-slot-v2">
          <InputField
            label={t('Street Address')}
            placeholder={t('Enter Street Name With Number')}
            value={addressField.value}
            onChange={(e) => addressField.onChange(e.target.value)}
            error={addressField.error || undefined}
            testID="createoredit-identity-input-address-v2"
          />
          <InputField
            label={t('Country')}
            placeholder={t('Enter Country')}
            value={countryField.value}
            onChange={(e) => countryField.onChange(e.target.value)}
            error={countryField.error || undefined}
            testID="createoredit-identity-input-country-v2"
          />
          <InputField
            label={t('City')}
            placeholder={t('Enter City')}
            value={cityField.value}
            onChange={(e) => cityField.onChange(e.target.value)}
            error={cityField.error || undefined}
            testID="createoredit-identity-input-city-v2"
          />
          <InputField
            label={t('Region / State / Province')}
            placeholder={t('Enter Region, State or Province')}
            value={regionField.value}
            onChange={(e) => regionField.onChange(e.target.value)}
            error={regionField.error || undefined}
            testID="createoredit-identity-input-region-v2"
          />
          <InputField
            label={t('ZIP / Postal code')}
            placeholder={t('Enter ZIP, or Postal Code')}
            value={zipField.value}
            onChange={(e) => zipField.onChange(e.target.value)}
            error={zipField.error || undefined}
            testID="createoredit-identity-input-zip-v2"
          />
        </MultiSlotInput>

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Passport Details')}
          </Text>
        </div>

        <MultiSlotInput testID="createoredit-identity-passport-slot-v2">
          <InputField
            label={t('Fullname')}
            placeholder={t('Enter Name as Shown on Passport')}
            value={passportFullNameField.value}
            onChange={(e) => passportFullNameField.onChange(e.target.value)}
            error={passportFullNameField.error || undefined}
            testID="createoredit-identity-input-passportfullname-v2"
          />
          <InputField
            label={t('Passport Number')}
            placeholder={t('Enter Passport Number')}
            value={passportNumberField.value}
            onChange={(e) => passportNumberField.onChange(e.target.value)}
            error={passportNumberField.error || undefined}
            testID="createoredit-identity-input-passportnumber-v2"
          />
          <InputField
            label={t('Issuing Country')}
            placeholder={t('Enter Issuing Country')}
            value={passportIssuingCountryField.value}
            onChange={(e) => passportIssuingCountryField.onChange(e.target.value)}
            error={passportIssuingCountryField.error || undefined}
            testID="createoredit-identity-input-passportissuingcountry-v2"
          />
          <DateField
            label={t('Date of Birth')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.passportDob}
            onChange={(e) => setValue('passportDob', e.target.value)}
            testID="createoredit-identity-input-passportdob-v2"
          />
          <DateField
            label={t('Date of Issue')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.passportDateOfIssue}
            onChange={(e) => setValue('passportDateOfIssue', e.target.value)}
            testID="createoredit-identity-input-passportdateofissue-v2"
          />
          <DateField
            label={t('Expiry Date')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.passportExpiryDate}
            onChange={(e) => setValue('passportExpiryDate', e.target.value)}
            testID="createoredit-identity-input-passportexpirydate-v2"
          />
          <InputField
            label={t('Nationality')}
            placeholder={t('Enter Nationality')}
            value={passportNationalityField.value}
            onChange={(e) => passportNationalityField.onChange(e.target.value)}
            error={passportNationalityField.error || undefined}
            testID="createoredit-identity-input-passportnationality-v2"
          />
          <InputField
            label={t('Gender')}
            placeholder={t('Enter Gender')}
            value={passportGenderField.value}
            onChange={(e) => passportGenderField.onChange(e.target.value)}
            error={passportGenderField.error || undefined}
            testID="createoredit-identity-input-passportgender-v2"
          />
        </MultiSlotInput>

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Identity Card Details')}
          </Text>
        </div>

        <MultiSlotInput testID="createoredit-identity-idcard-slot-v2">
          <InputField
            label={t('ID Number')}
            placeholder={t('Enter Your ID Number')}
            value={idCardNumberField.value}
            onChange={(e) => idCardNumberField.onChange(e.target.value)}
            error={idCardNumberField.error || undefined}
            testID="createoredit-identity-input-idcardnumber-v2"
          />
          <DateField
            label={t('Date of Issue')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.idCardDateOfIssue}
            onChange={(e) => setValue('idCardDateOfIssue', e.target.value)}
            testID="createoredit-identity-input-idcarddateofissue-v2"
          />
          <DateField
            label={t('Expiry Date')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.idCardExpiryDate}
            onChange={(e) => setValue('idCardExpiryDate', e.target.value)}
            testID="createoredit-identity-input-idcardexpirydate-v2"
          />
          <InputField
            label={t('Issuing Country')}
            placeholder={t('Enter Issuing Country')}
            value={idCardIssuingCountryField.value}
            onChange={(e) => idCardIssuingCountryField.onChange(e.target.value)}
            error={idCardIssuingCountryField.error || undefined}
            testID="createoredit-identity-input-idcardissuingcountry-v2"
          />
        </MultiSlotInput>

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Driving License Details')}
          </Text>
        </div>

        <MultiSlotInput testID="createoredit-identity-drivinglicense-slot-v2">
          <InputField
            label={t('ID Number')}
            placeholder={t('Enter Your ID Number')}
            value={drivingLicenseNumberField.value}
            onChange={(e) => drivingLicenseNumberField.onChange(e.target.value)}
            error={drivingLicenseNumberField.error || undefined}
            testID="createoredit-identity-input-drivinglicensenumber-v2"
          />
          <DateField
            label={t('Date of Issue')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.drivingLicenseDateOfIssue}
            onChange={(e) => setValue('drivingLicenseDateOfIssue', e.target.value)}
            testID="createoredit-identity-input-drivinglicensedateofissue-v2"
          />
          <DateField
            label={t('Expiry Date')}
            placeholder={t('Enter DD/MM/YYYY')}
            value={values.drivingLicenseExpiryDate}
            onChange={(e) => setValue('drivingLicenseExpiryDate', e.target.value)}
            testID="createoredit-identity-input-drivinglicenseexpirydate-v2"
          />
          <InputField
            label={t('Issuing Country')}
            placeholder={t('Enter Issuing Country')}
            value={drivingLicenseIssuingCountryField.value}
            onChange={(e) => drivingLicenseIssuingCountryField.onChange(e.target.value)}
            error={drivingLicenseIssuingCountryField.error || undefined}
            testID="createoredit-identity-input-drivinglicenseissuingcountry-v2"
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
          testID="createoredit-identity-input-comment-v2"
        />

        <MultiSlotInput
          testID="createoredit-identity-attachments-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={handleFileLoad}
              data-testid="createoredit-identity-button-addattachment-v2"
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
                  testID={`createoredit-identity-attachment-v2-${index}`}
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
                      data-testid={`createoredit-identity-button-deleteattachment-v2-${index}`}
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
            testID="createoredit-identity-attachment-upload-v2"
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
          testID="createoredit-identity-customfields-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addCustomField({ type: 'note', note: '' })}
              data-testid="createoredit-identity-button-addcustomfield-v2"
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
                testID={`createoredit-identity-input-customfield-v2-${index}`}
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
                      data-testid={`createoredit-identity-button-removecustomfield-v2-${index}`}
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
