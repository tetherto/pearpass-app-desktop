import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'
import { fileSchema } from '../schemas/fileSchema'

export const credentialSchema = Validator.object({
  authenticatorAttachment: Validator.string().required(),
  clientExtensionResults: Validator.object({
    credProps: Validator.object({
      rk: Validator.boolean().required()
    })
  }).required(),
  id: Validator.string().required(),
  rawId: Validator.string().required(),
  response: Validator.object({
    attestationObject: Validator.string().required(),
    authenticatorData: Validator.string().required(),
    clientDataJSON: Validator.string().required(),
    publicKey: Validator.string().required(),
    publicKeyAlgorithm: Validator.number().required(),
    transports: Validator.array().items(Validator.string()).required()
  }).required(),
  type: Validator.string().required(),
  _privateKey: Validator.string().required(),
  _userId: Validator.string().required()
})

export const loginSchema = Validator.object({
  title: Validator.string().required(),
  username: Validator.string(),
  password: Validator.string(),
  passwordUpdatedAt: Validator.number(),
  credential: credentialSchema,
  note: Validator.string(),
  websites: Validator.array().items(Validator.string().required()),
  customFields: Validator.array().items(customFieldSchema),
  attachments: Validator.array().items(fileSchema)
})

export const validateAndPrepareLoginData = (login) => {
  const loginData = {
    title: login.title,
    username: login.username,
    password: login.password,
    passwordUpdatedAt: login.passwordUpdatedAt,
    credential: login.credential,
    note: login.note,
    websites: login.websites,
    customFields: validateAndPrepareCustomFields(login.customFields),
    attachments: login.attachments
  }

  const errors = loginSchema.validate(loginData)

  if (errors) {
    throw new Error(`Invalid login data: ${JSON.stringify(errors, null, 2)}`)
  }

  return loginData
}
