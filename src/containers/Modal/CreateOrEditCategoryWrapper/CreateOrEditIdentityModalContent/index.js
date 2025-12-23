import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { DATE_FORMAT } from 'pearpass-lib-constants'
import { RECORD_TYPES, useCreateRecord, useRecords } from 'pearpass-lib-vault'

import { CreateCustomField } from '../../../../components/CreateCustomField'
import { FolderDropdown } from '../../../../components/FolderDropdown'
import { FormGroup } from '../../../../components/FormGroup'
import { FormModalHeaderWrapper } from '../../../../components/FormModalHeaderWrapper'
import { FormWrapper } from '../../../../components/FormWrapper'
import { InputFieldNote } from '../../../../components/InputFieldNote'
import { RecordTypeMenu } from '../../../../components/RecordTypeMenu'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import {
  ButtonLittle,
  ButtonSingleInput,
  CalendarIcon,
  DeleteIcon,
  EmailIcon,
  GenderIcon,
  GroupIcon,
  ImageIcon,
  InputField,
  NationalityIcon,
  PhoneIcon,
  SaveIcon,
  UserIcon
} from '../../../../lib-react-components'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { AttachmentField } from '../../../AttachmentField'
import { CustomFields } from '../../../CustomFields'
import { ImagesField } from '../../../ImagesField'
import { ModalContent } from '../../ModalContent'
import { DropdownsWrapper } from '../../styles'
import { UploadFilesModalContent } from '../../UploadImageModalContent'

/**
 * @param {{
 *   initialRecord: {
 *     data: {
 *       title: string
 *       fullName: string
 *       email: string
 *       phoneNumber: string
 *       address: string
 *       zip: string
 *       city: string
 *       region: string
 *       country: string
 *       note: string
 *       customFields: {
 *         note: string
 *         type: string
 *       }[]
 *       passportFullName: string
 *       passportNumber: string
 *       passportIssuingCountry: string
 *       passportDateOfIssue: string
 *       passportExpiryDate: string
 *       passportNationality: string
 *       passportDob: string
 *       passportGender: string
 *       passportPicture: { id: string, name: string}[]
 *       idCardNumber: string
 *       idCardDateOfIssue: string
 *       idCardExpiryDate: string
 *       idCardIssuingCountry: string
 *       idCardPicture: { id: string, name: string}[]
 *       drivingLicenseNumber: string
 *       drivingLicenseDateOfIssue: string
 *       drivingLicenseExpiryDate: string
 *       drivingLicenseIssuingCountry: string
 *       drivingLicensePicture: { id: string, name: string}[]
 *       attachments: { id: string, name: string}[]
 *     }
 *     folder?: string
 *   }
 *   selectedFolder?: string
 *   onTypeChange: (type: string) => void
 * }} props
 */
export const CreateOrEditIdentityModalContent = ({
  initialRecord,
  selectedFolder,
  onTypeChange
}) => {
  const { i18n } = useLingui()
  const { closeModal, setModal } = useModal()
  const { setToast } = useToast()

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      closeModal()

      setToast({
        message: i18n._('Record created successfully')
      })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      closeModal()

      setToast({
        message: i18n._('Record updated successfully')
      })
    }
  })

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const onError = (error) => {
    setToast({
      message: error.message
    })
  }

  const schema = Validator.object({
    title: Validator.string().required(i18n._('Title is required')),
    fullName: Validator.string(),
    email: Validator.string().email(i18n._('Invalid email format')),
    phoneNumber: Validator.string(),
    address: Validator.string(),
    zip: Validator.string(),
    city: Validator.string(),
    region: Validator.string(),
    country: Validator.string(),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string().required(i18n._('Note is required'))
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
    passportPicture: Validator.array().items(
      Validator.object({
        id: Validator.string(),
        name: Validator.string().required()
      })
    ),
    idCardNumber: Validator.string(),
    idCardDateOfIssue: Validator.string(),
    idCardExpiryDate: Validator.string(),
    idCardIssuingCountry: Validator.string(),
    idCardPicture: Validator.array().items(
      Validator.object({
        id: Validator.string(),
        name: Validator.string().required()
      })
    ),
    drivingLicenseNumber: Validator.string(),
    drivingLicenseDateOfIssue: Validator.string(),
    drivingLicenseExpiryDate: Validator.string(),
    drivingLicenseIssuingCountry: Validator.string(),
    drivingLicensePicture: Validator.array().items(
      Validator.object({
        id: Validator.string(),
        name: Validator.string().required()
      })
    ),
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
      passportPicture: initialRecord?.data?.passportPicture || [],
      idCardNumber: initialRecord?.data?.idCardNumber ?? '',
      idCardDateOfIssue: initialRecord?.data?.idCardDateOfIssue ?? '',
      idCardExpiryDate: initialRecord?.data?.idCardExpiryDate ?? '',
      idCardIssuingCountry: initialRecord?.data?.idCardIssuingCountry ?? '',
      idCardPicture: initialRecord?.data?.idCardPicture || [],
      drivingLicenseNumber: initialRecord?.data?.drivingLicenseNumber ?? '',
      drivingLicenseDateOfIssue:
        initialRecord?.data?.drivingLicenseDateOfIssue ?? '',
      drivingLicenseExpiryDate:
        initialRecord?.data?.drivingLicenseExpiryDate ?? '',
      drivingLicenseIssuingCountry:
        initialRecord?.data?.drivingLicenseIssuingCountry ?? '',
      drivingLicensePicture: initialRecord?.data?.drivingLicensePicture || [],
      attachments: initialRecord?.attachments || []
    },
    validate: (values) => schema.validate(values)
  })

  const {
    value: list,
    addItem,
    registerItem,
    removeItem
  } = registerArray('customFields')

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

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.IDENTITY,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        zip: values.zip,
        city: values.city,
        region: values.region,
        country: values.country,
        note: values.note,
        customFields: values.customFields,
        passportFullName: values.passportFullName,
        passportNumber: values.passportNumber,
        passportIssuingCountry: values.passportIssuingCountry,
        passportDateOfIssue: values.passportDateOfIssue,
        passportExpiryDate: values.passportExpiryDate,
        passportNationality: values.passportNationality,
        passportDob: values.passportDob,
        passportGender: values.passportGender,
        passportPicture: values.passportPicture,
        idCardNumber: values.idCardNumber,
        idCardDateOfIssue: values.idCardDateOfIssue,
        idCardExpiryDate: values.idCardExpiryDate,
        idCardIssuingCountry: values.idCardIssuingCountry,
        idCardPicture: values.idCardPicture,
        drivingLicenseNumber: values.drivingLicenseNumber,
        drivingLicenseDateOfIssue: values.drivingLicenseDateOfIssue,
        drivingLicenseExpiryDate: values.drivingLicenseExpiryDate,
        drivingLicenseIssuingCountry: values.drivingLicenseIssuingCountry,
        drivingLicensePicture: values.drivingLicensePicture,
        attachments: values.attachments
      }
    }

    if (initialRecord) {
      updateRecords(
        [
          {
            ...initialRecord,
            ...data
          }
        ],
        onError
      )
    } else {
      createRecord(data, onError)
    }
  }

  const handleFileLoad = (fieldName) => {
    setModal(
      html`<${UploadFilesModalContent}
        type=${'file'}
        onFilesSelected=${(files) =>
          handleFileSelect({
            files,
            fieldName,
            setValue,
            values
          })}
      />`
    )
  }

  const handleAttachmentRemove = (fieldName, index) => {
    const updatedAttachments = values[fieldName].filter(
      (_, idx) => idx !== index
    )
    setValue(fieldName, updatedAttachments)
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      onSubmit=${handleSubmit(onSubmit)}
      headerChildren=${html`
        <${FormModalHeaderWrapper}
          buttons=${html`
            <${ButtonLittle}
              testId="createoredit-button-loadfile"
              startIcon=${ImageIcon}
              onClick=${() => handleFileLoad(ATTACHMENTS_FIELD_KEY)}
            >
              ${i18n._('Load file')}
            <//>
            <${ButtonLittle}
              testId="createoredit-button-save"
              startIcon=${SaveIcon}
              type="submit"
            >
              ${i18n._('Save')}
            <//>
          `}
        >
          <${DropdownsWrapper}>
            <${FolderDropdown}
              testId="createoredit-dropdown-folder"
              selectedFolder=${values?.folder}
              onFolderSelect=${(folder) => setValue('folder', folder?.name)}
            />
            ${!initialRecord &&
            html` <${RecordTypeMenu}
              testId="createoredit-dropdown-recordtype"
              selectedRecord=${RECORD_TYPES.IDENTITY}
              onRecordSelect=${(record) => onTypeChange(record?.type)}
            />`}
          <//>
        <//>
      `}
    >
      <${FormWrapper}>
        <${FormGroup}>
          <${InputField}
            testId="createoredit-input-title"
            label=${i18n._('Title')}
            placeholder=${i18n._('Insert title')}
            variant="outline"
            ...${register('title')}
          />
        <//>

        <${FormGroup} title=${i18n._('Personal information')} isCollapse>
          <${InputField}
            testId="createoredit-input-fullname"
            label=${i18n._('Full name')}
            placeholder=${i18n._('Full name')}
            variant="outline"
            icon=${UserIcon}
            ...${register('fullName')}
          />

          <${InputField}
            testId="createoredit-input-email"
            label=${i18n._('Email')}
            placeholder=${i18n._('Insert email')}
            variant="outline"
            icon=${EmailIcon}
            ...${register('email')}
          />

          <${InputField}
            testId="createoredit-input-phonenumber"
            label=${i18n._('Phone number ')}
            placeholder=${i18n._('Phone number ')}
            variant="outline"
            icon=${PhoneIcon}
            ...${register('phoneNumber')}
          />
        <//>

        <${FormGroup} title=${i18n._('Detail of address')} isCollapse>
          <${InputField}
            testId="createoredit-input-address"
            label=${i18n._('Address')}
            placeholder=${i18n._('Address')}
            variant="outline"
            ...${register('address')}
          />

          <${InputField}
            testId="createoredit-input-zip"
            label=${i18n._('ZIP')}
            placeholder=${i18n._('Insert zip')}
            variant="outline"
            ...${register('zip')}
          />

          <${InputField}
            testId="createoredit-input-city"
            label=${i18n._('City')}
            placeholder=${i18n._('City')}
            variant="outline"
            ...${register('city')}
          />

          <${InputField}
            testId="createoredit-input-region"
            label=${i18n._('Region')}
            placeholder=${i18n._('Region')}
            variant="outline"
            ...${register('region')}
          />

          <${InputField}
            testId="createoredit-input-country"
            label=${i18n._('Country')}
            placeholder=${i18n._('Country')}
            variant="outline"
            ...${register('country')}
          />
        <//>

        <${FormGroup}
          defaultOpenState=${false}
          title=${i18n._('Passport')}
          isCollapse
        >
          <div>
            <${InputField}
              testId="createoredit-input-passportfullname"
              label=${i18n._('Full name')}
              placeholder="John Smith"
              variant="outline"
              icon=${UserIcon}
              ...${register('passportFullName')}
            />

            <${InputField}
              testId="createoredit-input-passportnumber"
              label=${i18n._('Passport number')}
              placeholder=${i18n._('Insert numbers')}
              variant="outline"
              icon=${GroupIcon}
              ...${register('passportNumber')}
            />

            <${InputField}
              testId="createoredit-input-passportissuingcountry"
              label=${i18n._('Issuing country')}
              placeholder=${i18n._('Insert country')}
              variant="outline"
              icon=${NationalityIcon}
              ...${register('passportIssuingCountry')}
            />

            <${InputField}
              testId="createoredit-input-passportdateofissue"
              label=${i18n._('Date of issue')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('passportDateOfIssue')}
            />

            <${InputField}
              testId="createoredit-input-passportexpirydate"
              label=${i18n._('Expiry Date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('passportExpiryDate')}
            />

            <${InputField}
              testId="createoredit-input-passportnationality"
              label=${i18n._('Nationality')}
              placeholder=${i18n._('Insert your nationality')}
              variant="outline"
              icon=${NationalityIcon}
              ...${register('passportNationality')}
            />

            <${InputField}
              testId="createoredit-input-passportdob"
              label=${i18n._('Date of birth')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('passportDob')}
            />

            <${InputField}
              testId="createoredit-input-passportgender"
              label=${i18n._('Gender')}
              placeholder=${i18n._('M/F')}
              variant="outline"
              icon=${GenderIcon}
              ...${register('passportGender')}
            />
          <//>
          <${ImagesField}
            testId="createoredit-imagesfield-passportimages"
            title=${i18n._('Passport Images')}
            onAdd=${() => handleFileLoad('passportPicture')}
            pictures=${values.passportPicture}
            onRemove=${(index) =>
              handleAttachmentRemove('passportPicture', index)}
          />
        <//>

        <${FormGroup}
          defaultOpenState=${false}
          title=${i18n._('Identity card')}
          isCollapse
        >
          <div>
            <${InputField}
              testId="createoredit-input-idcardnumber"
              label=${i18n._('ID number')}
              placeholder="123456789"
              variant="outline"
              icon=${GroupIcon}
              ...${register('idCardNumber')}
            />

            <${InputField}
              testId="createoredit-input-idcarddateofissue"
              label=${i18n._('Creation date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('idCardDateOfIssue')}
            />

            <${InputField}
              testId="createoredit-input-idcardexpirydate"
              label=${i18n._('Expiry date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('idCardExpiryDate')}
            />

            <${InputField}
              testId="createoredit-input-idcardissuingcountry"
              label=${i18n._('Issue country')}
              placeholder=${i18n._('Insert country')}
              variant="outline"
              icon=${NationalityIcon}
              ...${register('idCardIssuingCountry')}
            />
          <//>
          <${ImagesField}
            testId="createoredit-imagesfield-idcardimages"
            title=${i18n._('Identity Card Images')}
            onAdd=${() => handleFileLoad('idCardPicture')}
            pictures=${values.idCardPicture}
            onRemove=${(index) =>
              handleAttachmentRemove('idCardPicture', index)}
          />
        <//>

        <${FormGroup}
          defaultOpenState=${false}
          title=${i18n._('Driving license')}
          isCollapse
        >
          <div>
            <${InputField}
              testId="createoredit-input-drivinglicensenumber"
              label=${i18n._('ID number')}
              placeholder="123456789"
              variant="outline"
              icon=${GroupIcon}
              ...${register('drivingLicenseNumber')}
            />

            <${InputField}
              testId="createoredit-input-drivinglicensedateofissue"
              label=${i18n._('Creation date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('drivingLicenseDateOfIssue')}
            />

            <${InputField}
              testId="createoredit-input-drivinglicenseexpirydate"
              label=${i18n._('Expiry date')}
              placeholder=${DATE_FORMAT}
              variant="outline"
              icon=${CalendarIcon}
              ...${register('drivingLicenseExpiryDate')}
            />

            <${InputField}
              testId="createoredit-input-drivinglicenseissuingcountry"
              label=${i18n._('Issue country')}
              placeholder=${i18n._('Insert country')}
              variant="outline"
              icon=${NationalityIcon}
              ...${register('drivingLicenseIssuingCountry')}
            />
          <//>
          <${ImagesField}
            testId="createoredit-imagesfield-drivinglicenseimages"
            title=${i18n._('Driving License Images')}
            onAdd=${() => handleFileLoad('drivingLicensePicture')}
            pictures=${values.drivingLicensePicture}
            onRemove=${(index) =>
              handleAttachmentRemove('drivingLicensePicture', index)}
          />
        <//>

        ${values.attachments.length > 0 &&
        html`
          <${FormGroup}>
            ${values.attachments.map(
              (attachment, index) =>
                html`<${AttachmentField}
                  testId="createoredit-attachment"
                  attachment=${attachment}
                  label=${i18n._('File')}
                  additionalItems=${html`
                    <${ButtonSingleInput}
                      testId="createoredit-button-deleteattachment"
                      startIcon=${DeleteIcon}
                      onClick=${() =>
                        handleAttachmentRemove(ATTACHMENTS_FIELD_KEY, index)}
                    >
                      ${i18n._('Delete File')}
                    <//>
                  `}
                />`
            )}
          <//>
        `}

        <${FormGroup}>
          <${InputFieldNote}
            testId="createoredit-input-note"
            ...${register('note')}
          />
        <//>

        <${CustomFields}
          customFields=${list}
          register=${registerItem}
          removeItem=${removeItem}
        />

        <${FormGroup}>
          <${CreateCustomField}
            testId="createoredit-createcustomfield"
            onCreateCustom=${(type) => addItem({ type: type, name: type })}
          />
        <//>
      <//>
    <//>
  `
}
