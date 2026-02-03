import React, { useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { DATE_FORMAT } from 'pearpass-lib-constants'

import { CopyButton } from '../../../components/CopyButton'
import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { InputFieldNote } from '../../../components/InputFieldNote'
import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import {
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
      html` <${FormGroup}
        testId="identitydetails-section-personalinfo"
        title=${i18n._('Personal information')}
        isCollapse
      >
        ${!!values?.fullName?.length &&
        html`
          <${InputField}
            testId="identitydetails-field-fullname"
            label=${i18n._('Full name')}
            placeholder=${i18n._('Full name')}
            variant="outline"
            icon=${UserIcon}
            isDisabled
            ...${register('fullName')}
            additionalItems=${html`
              <${CopyButton} value=${values.fullName} />
            `}
          />
        `}
        ${!!values?.email?.length &&
        html` <${InputField}
          testId="identitydetails-field-email"
          label=${i18n._('Email')}
          placeholder=${i18n._('Insert email')}
          variant="outline"
          icon=${EmailIcon}
          isDisabled
          ...${register('email')}
          additionalItems=${html` <${CopyButton} value=${values.email} /> `}
        />`}
        ${!!values?.phoneNumber?.length &&
        html`
          <${InputField}
            testId="identitydetails-field-phonenumber"
            label=${i18n._('Phone number ')}
            placeholder=${i18n._('Phone number ')}
            variant="outline"
            icon=${PhoneIcon}
            isDisabled
            ...${register('phoneNumber')}
            additionalItems=${html`
              <${CopyButton} value=${values.phoneNumber} />
            `}
          />
        `}
      <//>`}
      ${(hasAddress || hasZip || hasCity || hasRegion || hasCountry) &&
      html`
        <${FormGroup}
          testId="identitydetails-section-address"
          title=${i18n._('Detail of address')}
          isCollapse
        >
          ${!!values?.address?.length &&
          html`
            <${InputField}
              testId="identitydetails-field-address"
              label=${i18n._('Address')}
              placeholder=${i18n._('Address')}
              variant="outline"
              isDisabled
              ...${register('address')}
              additionalItems=${html`
                <${CopyButton} value=${values.address} />
              `}
            />
          `}
          ${!!values?.zip?.length &&
          html`
            <${InputField}
              testId="identitydetails-field-zip"
              label=${i18n._('ZIP')}
              placeholder=${i18n._('Insert zip')}
              variant="outline"
              isDisabled
              ...${register('zip')}
              additionalItems=${html` <${CopyButton} value=${values.zip} /> `}
            />
          `}
          ${!!values?.city?.length &&
          html`
            <${InputField}
              testId="identitydetails-field-city"
              label=${i18n._('City')}
              placeholder=${i18n._('City')}
              variant="outline"
              isDisabled
              ...${register('city')}
              additionalItems=${html` <${CopyButton} value=${values.city} /> `}
            />
          `}
          ${!!values?.region?.length &&
          html`
            <${InputField}
              testId="identitydetails-field-region"
              label=${i18n._('Region')}
              placeholder=${i18n._('Region')}
              variant="outline"
              isDisabled
              ...${register('region')}
              additionalItems=${html`
                <${CopyButton} value=${values.region} />
              `}
            />
          `}
          ${!!values?.country?.length &&
          html`
            <${InputField}
              testId="identitydetails-field-country"
              label=${i18n._('Country')}
              placeholder=${i18n._('Country')}
              variant="outline"
              isDisabled
              ...${register('country')}
              additionalItems=${html`
                <${CopyButton} value=${values.country} />
              `}
            />
          `}
        <//>
      `}
      ${hasPassport &&
      html`
        <${FormGroup}
          testId="identitydetails-section-passport"
          title=${i18n._('Passport')}
          isCollapse
        >
          <div>
            ${hasPassportFullName &&
            html`
              <${InputField}
                testId="identitydetails-field-passportfullname"
                label=${i18n._('Full name')}
                placeholder=${i18n._('John Smith')}
                variant="outline"
                isDisabled
                ...${register('passportFullName')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportFullName} />
                `}
              />
            `}
            ${hasPassportNumber &&
            html`
              <${InputField}
                testId="identitydetails-field-passportnumber"
                label=${i18n._('Passport number')}
                placeholder=${i18n._('Insert numbers')}
                variant="outline"
                isDisabled
                ...${register('passportNumber')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportNumber} />
                `}
              />
            `}
            ${hasPassportIssuingCountry &&
            html`
              <${InputField}
                testId="identitydetails-field-passportissuingcountry"
                label=${i18n._('Issuing country')}
                placeholder=${i18n._('Insert country')}
                variant="outline"
                isDisabled
                ...${register('passportIssuingCountry')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportIssuingCountry} />
                `}
              />
            `}
            ${hasPassportDateOfIssue &&
            html`
              <${InputField}
                testId="identitydetails-field-passportdateofissue"
                label=${i18n._('Date of issue')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                isDisabled
                ...${register('passportDateOfIssue')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportDateOfIssue} />
                `}
              />
            `}
            ${hasPassportExpiryDate &&
            html`
              <${InputField}
                testId="identitydetails-field-passportexpirydate"
                label=${i18n._('Expiry date')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                isDisabled
                ...${register('passportExpiryDate')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportExpiryDate} />
                `}
              />
            `}
            ${hasPassportNationality &&
            html`
              <${InputField}
                testId="identitydetails-field-passportnationality"
                label=${i18n._('Nationality')}
                placeholder=${i18n._('Insert your nationality')}
                variant="outline"
                isDisabled
                ...${register('passportNationality')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportNationality} />
                `}
              />
            `}
            ${hasPassportDob &&
            html`
              <${InputField}
                testId="identitydetails-field-passportdob"
                label=${i18n._('Date of birth')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                isDisabled
                ...${register('passportDob')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportDob} />
                `}
              />
            `}
            ${hasPassportGender &&
            html`
              <${InputField}
                testId="identitydetails-field-passportgender"
                label=${i18n._('Gender')}
                placeholder=${i18n._('M/F')}
                variant="outline"
                isDisabled
                ...${register('passportGender')}
                additionalItems=${html`
                  <${CopyButton} value=${values.passportGender} />
                `}
              />
            `}
          <//>
          ${hasPassportPicture &&
          html` <${ImagesField}
            testId="identitydetails-imagesfield-passport"
            title=${i18n._('Passport Images')}
            pictures=${values.passportPicture}
          />`}
        <//>
      `}
      ${hasIdCard &&
      html`
        <${FormGroup}
          testId="identitydetails-section-idcard"
          title=${i18n._('Identity Card')}
          isCollapse
        >
          <div>
            ${hasIdCardNumber &&
            html`
              <${InputField}
                testId="identitydetails-field-idcardnumber"
                label=${i18n._('ID card number')}
                placeholder="123456789"
                variant="outline"
                isDisabled
                ...${register('idCardNumber')}
                additionalItems=${html`
                  <${CopyButton} value=${values.idCardNumber} />
                `}
              />
            `}
            ${hasIdCardDateOfIssue &&
            html`
              <${InputField}
                testId="identitydetails-field-idcarddateofissue"
                label=${i18n._('Creation date')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                isDisabled
                ...${register('idCardDateOfIssue')}
                additionalItems=${html`
                  <${CopyButton} value=${values.idCardDateOfIssue} />
                `}
              />
            `}
            ${hasIdCardExpiryDate &&
            html`
              <${InputField}
                testId="identitydetails-field-idcardexpirydate"
                label=${i18n._('Expiry date')}
                placeholder=${DATE_FORMAT}
                variant="outline"
                isDisabled
                ...${register('idCardExpiryDate')}
                additionalItems=${html`
                  <${CopyButton} value=${values.idCardExpiryDate} />
                `}
              />
            `}
            ${hasIdCardIssuingCountry &&
            html`
              <${InputField}
                testId="identitydetails-field-idcardissuingcountry"
                label=${i18n._('Issuing country')}
                placeholder=${i18n._('Insert country')}
                variant="outline"
                isDisabled
                ...${register('idCardIssuingCountry')}
                additionalItems=${html`
                  <${CopyButton} value=${values.idCardIssuingCountry} />
                `}
              />
            `}
          <//>
          ${hasIdCardPicture &&
          html` <${ImagesField}
            testId="identitydetails-imagesfield-idcard"
            title=${i18n._('Identity Card Images')}
            pictures=${values.idCardPicture}
          />`}
        <//>
      `}
      ${hasDrivingLicense &&
      html` <${FormGroup}
        testId="identitydetails-section-drivinglicense"
        title=${i18n._('Driving license')}
        isCollapse
      >
        <div>
          ${hasDrivingLicenseNumber &&
          html`
            <${InputField}
              testId="identitydetails-field-drivinglicensenumber"
              label=${i18n._('Driving license number')}
              placeholder="123456789"
              variant="outline"
              isDisabled
              ...${register('drivingLicenseNumber')}
              additionalItems=${html`
                <${CopyButton} value=${values.drivingLicenseNumber} />
              `}
            />
          `}
          ${hasDrivingLicenseDateOfIssue &&
          html`
            <${InputField}
              testId="identitydetails-field-drivinglicensedateofissue"
              label=${i18n._('Creation date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              isDisabled
              ...${register('drivingLicenseDateOfIssue')}
              additionalItems=${html`
                <${CopyButton} value=${values.drivingLicenseDateOfIssue} />
              `}
            />
          `}
          ${hasDrivingLicenseExpiryDate &&
          html`
            <${InputField}
              testId="identitydetails-field-drivinglicenseexpirydate"
              label=${i18n._('Expiry date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              isDisabled
              ...${register('drivingLicenseExpiryDate')}
              additionalItems=${html`
                <${CopyButton} value=${values.drivingLicenseExpiryDate} />
              `}
            />
          `}
          ${hasDrivingLicenseIssuingCountry &&
          html`
            <${InputField}
              testId="identitydetails-field-drivinglicenseissuingcountry"
              label=${i18n._('Issuing country')}
              placeholder=${i18n._('Insert country')}
              variant="outline"
              isDisabled
              ...${register('drivingLicenseIssuingCountry')}
              additionalItems=${html`
                <${CopyButton} value=${values.drivingLicenseIssuingCountry} />
              `}
            />
          `}
        <//>
        ${hasDrivingLicensePicture &&
        html` <${ImagesField}
          testId="identitydetails-imagesfield-drivinglicense"
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
                testId="identitydetails-attachment"
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
            testId="identitydetails-field-note"
            isDisabled
            ...${register('note')}
            additionalItems=${html` <${CopyButton} value=${values.note} /> `}
          />
        <//>
      `}
      ${hasCustomFields &&
      html`
        <${FormGroup}>
          <${CustomFields}
            areInputsDisabled=${true}
            customFields=${list}
            register=${registerItem}
          />
        <//>
      `}
    <//>
  `
}
