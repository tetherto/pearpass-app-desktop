import { Validator } from 'pear-apps-utils-validator'

import { processFiles } from './processFiles'
import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'
import { fileSchema } from '../schemas/fileSchema'

export const identitySchema = Validator.object({
  title: Validator.string().required(),
  fullName: Validator.string(),
  email: Validator.string().email(),
  phoneNumber: Validator.string(),
  address: Validator.string(),
  zip: Validator.string(),
  city: Validator.string(),
  region: Validator.string(),
  country: Validator.string(),
  note: Validator.string(),
  customFields: Validator.array().items(customFieldSchema),
  passportFullName: Validator.string(),
  passportNumber: Validator.string(),
  passportIssuingCountry: Validator.string(),
  passportDateOfIssue: Validator.string(),
  passportExpiryDate: Validator.string(),
  passportNationality: Validator.string(),
  passportDob: Validator.string(),
  passportGender: Validator.string(),
  passportPicture: Validator.array().items(fileSchema),
  idCardNumber: Validator.string(),
  idCardDateOfIssue: Validator.string(),
  idCardExpiryDate: Validator.string(),
  idCardIssuingCountry: Validator.string(),
  idCardPicture: Validator.array().items(fileSchema),
  drivingLicenseNumber: Validator.string(),
  drivingLicenseDateOfIssue: Validator.string(),
  drivingLicenseExpiryDate: Validator.string(),
  drivingLicenseIssuingCountry: Validator.string(),
  drivingLicensePicture: Validator.array().items(fileSchema),
  attachments: Validator.array().items(fileSchema)
})

export const validateAndPrepareIdentityData = (identity) => {
  const identityData = {
    title: identity.title,
    fullName: identity.fullName,
    email: identity.email,
    phoneNumber: identity.phoneNumber,
    address: identity.address,
    zip: identity.zip,
    city: identity.city,
    region: identity.region,
    country: identity.country,
    note: identity.note,
    customFields: validateAndPrepareCustomFields(identity.customFields),
    passportFullName: identity.passportFullName,
    passportNumber: identity.passportNumber,
    passportIssuingCountry: identity.passportIssuingCountry,
    passportDateOfIssue: identity.passportDateOfIssue,
    passportExpiryDate: identity.passportExpiryDate,
    passportNationality: identity.passportNationality,
    passportDob: identity.passportDob,
    passportGender: identity.passportGender,
    passportPicture: identity.passportPicture,
    idCardNumber: identity.idCardNumber,
    idCardDateOfIssue: identity.idCardDateOfIssue,
    idCardExpiryDate: identity.idCardExpiryDate,
    idCardIssuingCountry: identity.idCardIssuingCountry,
    idCardPicture: identity.idCardPicture,
    drivingLicenseNumber: identity.drivingLicenseNumber,
    drivingLicenseDateOfIssue: identity.drivingLicenseDateOfIssue,
    drivingLicenseExpiryDate: identity.drivingLicenseExpiryDate,
    drivingLicenseIssuingCountry: identity.drivingLicenseIssuingCountry,
    drivingLicensePicture: identity.drivingLicensePicture,
    attachments: identity.attachments
  }

  const errors = identitySchema.validate(identityData)

  if (errors) {
    throw new Error(`Invalid identity data: ${JSON.stringify(errors, null, 2)}`)
  }

  return identityData
}

/**
 * @param {Object} identity
 * @param {Array|Object} [identity.passportPicture]
 * @param {Array|Object} [identity.drivingLicensePicture]
 * @param {Array|Object} [identity.idCardPicture]
 * @returns {{
 *  identityData: Object,
 *  buffersWithId: Array<{ id: string, buffer: Buffer }>
 * }}
 */
export const prepareIdentityFiles = (identity) => {
  const { files: passportPicture, buffersWithId: passportBuffersWithId } =
    processFiles(identity?.passportPicture)

  const {
    files: drivingLicensePicture,
    buffersWithId: drivingLicenseBuffersWithId
  } = processFiles(identity?.drivingLicensePicture)

  const { files: idCardPicture, buffersWithId: idCardBuffersWithId } =
    processFiles(identity?.idCardPicture)

  return {
    identityData: {
      ...identity,
      passportPicture,
      drivingLicensePicture,
      idCardPicture
    },
    buffersWithId: [
      ...passportBuffersWithId,
      ...drivingLicenseBuffersWithId,
      ...idCardBuffersWithId
    ]
  }
}
