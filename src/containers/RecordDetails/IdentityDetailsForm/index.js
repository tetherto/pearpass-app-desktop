import React, { useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { DATE_FORMAT } from 'pearpass-lib-constants'

import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { InputFieldNote } from '../../../components/InputFieldNote'
import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useToast } from '../../../context/ToastContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import {
  CopyIcon,
  EmailIcon,
  InputField,
  PhoneIcon,
  UserIcon
} from '../../../lib-react-components'
import { AttachmentField } from '../../AttachmentField'
import { CustomFields } from '../../CustomFields'
import { ImagesField } from '../../ImagesField'

/**
 * @param {{
 *   initialRecord: {
 *    data: {
 *     title: string
 *     fullName: string
 *     email: string
 *     phoneNumber: string
 *     address: string
 *     zip: string
 *     city: string
 *     region: string
 *     country: string
 *     note: string
 *     customFields: {
 *       note: string
 *       type: string
 *     }[]
 *     attachments: { id: string, name: string}[]
 *   }
 *  }
 *  selectedFolder?: string
 * }} props
 */
export const IdentityDetailsForm = ({ initialRecord, selectedFolder }) => {
  const { i18n } = useLingui()

  const { setToast } = useToast()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: i18n._('Copied to clipboard'),
        icon: CopyIcon
      })
    }
  })

  const initialValues = React.useMemo(
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
      customFields: initialRecord?.data?.customFields || [],
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

  const { register, registerArray, setValues, values, setValue } = useForm({
    initialValues
  })

  const { value: list, registerItem } = registerArray('customFields')

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

  const handleCopy = (value) => {
    if (!value?.length) {
      return
    }

    copyToClipboard(value)
  }
  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasFullName = !!values?.fullName?.length
  const hasEmail = !!values?.email?.length
  const hasPhoneNumber = !!values?.phoneNumber?.length
  const hasAddress = !!values?.address?.length
  const hasZip = !!values?.zip?.length
  const hasCity = !!values?.city?.length
  const hasRegion = !!values?.region?.length
  const hasCountry = !!values?.country?.length
  const hasNote = !!values?.note?.length
  const hasCustomFields = !!list.length
  const hasPassportFullName = !!values?.passportFullName?.length
  const hasPassportNumber = !!values?.passportNumber?.length
  const hasPassportIssuingCountry = !!values?.passportIssuingCountry?.length
  const hasPassportDateOfIssue = !!values?.passportDateOfIssue?.length
  const hasPassportExpiryDate = !!values?.passportExpiryDate?.length
  const hasPassportNationality = !!values?.passportNationality?.length
  const hasPassportDob = !!values?.passportDob?.length
  const hasPassportGender = !!values?.passportGender?.length
  const hasPassportPicture = !!values?.passportPicture?.length
  const hasIdCardNumber = !!values?.idCardNumber?.length
  const hasIdCardDateOfIssue = !!values?.idCardDateOfIssue?.length
  const hasIdCardExpiryDate = !!values?.idCardExpiryDate?.length
  const hasIdCardIssuingCountry = !!values?.idCardIssuingCountry?.length
  const hasIdCardPicture = !!values?.idCardPicture?.length
  const hasDrivingLicenseNumber = !!values?.drivingLicenseNumber?.length
  const hasDrivingLicenseDateOfIssue =
    !!values?.drivingLicenseDateOfIssue?.length
  const hasDrivingLicenseExpiryDate = !!values?.drivingLicenseExpiryDate?.length
  const hasDrivingLicenseIssuingCountry =
    !!values?.drivingLicenseIssuingCountry?.length
  const hasDrivingLicensePicture = !!values?.drivingLicensePicture?.length

  const hasPassport =
    hasPassportFullName ||
    hasPassportNumber ||
    hasPassportIssuingCountry ||
    hasPassportDateOfIssue ||
    hasPassportExpiryDate ||
    hasPassportNationality ||
    hasPassportDob ||
    hasPassportGender ||
    hasPassportPicture

  const hasIdCard =
    hasIdCardNumber ||
    hasIdCardDateOfIssue ||
    hasIdCardExpiryDate ||
    hasIdCardIssuingCountry ||
    hasIdCardPicture

  const hasDrivingLicense =
    hasDrivingLicenseNumber ||
    hasDrivingLicenseDateOfIssue ||
    hasDrivingLicenseExpiryDate ||
    hasDrivingLicenseIssuingCountry ||
    hasDrivingLicensePicture

  return html`
    <${FormWrapper}>
      ${(hasFullName || hasEmail || hasPhoneNumber) &&
      html` <${FormGroup} title=${i18n._('Personal information')} isCollapse>
        ${!!values?.fullName?.length &&
        html`
          <${InputField}
            label=${i18n._('Full name')}
            placeholder=${i18n._('Full name')}
            variant="outline"
            icon=${UserIcon}
            onClick=${handleCopy}
            isDisabled
            ...${register('fullName')}
          />
        `}
        ${!!values?.email?.length &&
        html` <${InputField}
          label=${i18n._('Email')}
          placeholder=${i18n._('Insert email')}
          variant="outline"
          icon=${EmailIcon}
          onClick=${handleCopy}
          isDisabled
          ...${register('email')}
        />`}
        ${!!values?.phoneNumber?.length &&
        html`
          <${InputField}
            label=${i18n._('Phone number ')}
            placeholder=${i18n._('Phone number ')}
            variant="outline"
            icon=${PhoneIcon}
            onClick=${handleCopy}
            isDisabled
            ...${register('phoneNumber')}
          />
        `}
      <//>`}
      ${(hasAddress || hasZip || hasCity || hasRegion || hasCountry) &&
      html`
        <${FormGroup} title=${i18n._('Detail of address')} isCollapse>
          ${!!values?.address?.length &&
          html`
            <${InputField}
              label=${i18n._('Address')}
              placeholder=${i18n._('Address')}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('address')}
            />
          `}
          ${!!values?.zip?.length &&
          html`
            <${InputField}
              label=${i18n._('ZIP')}
              placeholder=${i18n._('Insert zip')}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('zip')}
            />
          `}
          ${!!values?.city?.length &&
          html`
            <${InputField}
              label=${i18n._('City')}
              placeholder=${i18n._('City')}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('city')}
            />
          `}
          ${!!values?.region?.length &&
          html`
            <${InputField}
              label=${i18n._('Region')}
              placeholder=${i18n._('Region')}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('region')}
            />
          `}
          ${!!values?.country?.length &&
          html`
            <${InputField}
              label=${i18n._('Country')}
              placeholder=${i18n._('Country')}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('country')}
            />
          `}
        <//>
      `}
      ${hasPassport &&
      html`
        <${FormGroup} title=${i18n._('Passport')} isCollapse>
          <div>
            ${hasPassportFullName &&
            html`
              <${InputField}
                label=${i18n._('Full name')}
                placeholder=${i18n._('John Smith')}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportFullName')}
              />
            `}
            ${hasPassportNumber &&
            html`
              <${InputField}
                label=${i18n._('Passport number')}
                placeholder=${i18n._('Insert numbers')}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportNumber')}
              />
            `}
            ${hasPassportIssuingCountry &&
            html`
              <${InputField}
                label=${i18n._('Issuing country')}
                placeholder=${i18n._('Insert country')}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportIssuingCountry')}
              />
            `}
            ${hasPassportDateOfIssue &&
            html`
              <${InputField}
                label=${i18n._('Date of issue')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportDateOfIssue')}
              />
            `}
            ${hasPassportExpiryDate &&
            html`
              <${InputField}
                label=${i18n._('Expiry date')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportExpiryDate')}
              />
            `}
            ${hasPassportNationality &&
            html`
              <${InputField}
                label=${i18n._('Nationality')}
                placeholder=${i18n._('Insert your nationality')}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportNationality')}
              />
            `}
            ${hasPassportDob &&
            html`
              <${InputField}
                label=${i18n._('Date of birth')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportDob')}
              />
            `}
            ${hasPassportGender &&
            html`
              <${InputField}
                label=${i18n._('Gender')}
                placeholder=${i18n._('M/F')}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('passportGender')}
              />
            `}
          <//>
          ${hasPassportPicture &&
          html` <${ImagesField}
            title=${i18n._('Passport Images')}
            pictures=${values.passportPicture}
          />`}
        <//>
      `}
      ${hasIdCard &&
      html`
        <${FormGroup} title=${i18n._('Identity Card')} isCollapse>
          <div>
            ${hasIdCardNumber &&
            html`
              <${InputField}
                label=${i18n._('ID card number')}
                placeholder="123456789"
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('idCardNumber')}
              />
            `}
            ${hasIdCardDateOfIssue &&
            html`
              <${InputField}
                label=${i18n._('Creation date')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('idCardDateOfIssue')}
              />
            `}
            ${hasIdCardExpiryDate &&
            html`
              <${InputField}
                label=${i18n._('Expiry date')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('idCardExpiryDate')}
              />
            `}
            ${hasIdCardIssuingCountry &&
            html`
              <${InputField}
                label=${i18n._('Issuing country')}
                placeholder=${i18n._('Insert country')}
                variant="outline"
                onClick=${handleCopy}
                isDisabled
                ...${register('idCardIssuingCountry')}
              />
            `}
          <//>
          ${hasIdCardPicture &&
          html` <${ImagesField}
            title=${i18n._('Identity Card Images')}
            pictures=${values.idCardPicture}
          />`}
        <//>
      `}
      ${hasDrivingLicense &&
      html` <${FormGroup} title=${i18n._('Driving license')} isCollapse>
        <div>
          ${hasDrivingLicenseNumber &&
          html`
            <${InputField}
              label=${i18n._('Driving license number')}
              placeholder="123456789"
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('drivingLicenseNumber')}
            />
          `}
          ${hasDrivingLicenseDateOfIssue &&
          html`
            <${InputField}
              label=${i18n._('Creation date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('drivingLicenseDateOfIssue')}
            />
          `}
          ${hasDrivingLicenseExpiryDate &&
          html`
            <${InputField}
              label=${i18n._('Expiry date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('drivingLicenseExpiryDate')}
            />
          `}
          ${hasDrivingLicenseIssuingCountry &&
          html`
            <${InputField}
              label=${i18n._('Issuing country')}
              placeholder=${i18n._('Insert country')}
              variant="outline"
              onClick=${handleCopy}
              isDisabled
              ...${register('drivingLicenseIssuingCountry')}
            />
          `}
        <//>
        ${hasDrivingLicensePicture &&
        html` <${ImagesField}
          title=${i18n._('Driving License Images')}
          pictures=${values.drivingLicensePicture}
        />`}
      <//>`}
      ${values?.attachments?.length > 0 &&
      html`
        <${FormGroup}>
          ${values.attachments.map(
            (attachment) => html`
              <${AttachmentField}
                label=${i18n._('File')}
                attachment=${attachment}
              />
            `
          )}
        <//>
      `}
      ${hasNote &&
      html`
        <${FormGroup}>
          <${InputFieldNote}
            onClick=${handleCopy}
            isDisabled
            ...${register('note')}
          />
        <//>
      `}
      ${hasCustomFields &&
      html`
        <${FormGroup}>
          <${CustomFields}
            areInputsDisabled=${true}
            customFields=${list}
            onClick=${handleCopy}
            register=${registerItem}
          />
        <//>
      `}
    <//>
  `
}
