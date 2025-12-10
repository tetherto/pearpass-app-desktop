import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'
import { fileSchema } from '../schemas/fileSchema'

export const creditCardSchema = Validator.object({
  title: Validator.string().required(),
  name: Validator.string(),
  number: Validator.string(),
  expireDate: Validator.string(),
  securityCode: Validator.string(),
  pinCode: Validator.string(),
  note: Validator.string(),
  customFields: Validator.array().items(customFieldSchema),
  attachments: Validator.array().items(fileSchema)
})

export const validateAndPrepareCreditCardData = (creditCard) => {
  const creditCardData = {
    title: creditCard.title,
    name: creditCard.name,
    number: creditCard.number,
    expireDate: creditCard.expireDate,
    securityCode: creditCard.securityCode,
    pinCode: creditCard.pinCode,
    note: creditCard.note,
    customFields: validateAndPrepareCustomFields(creditCard.customFields),
    attachments: creditCard.attachments
  }

  const errors = creditCardSchema.validate(creditCardData)

  if (errors) {
    throw new Error(
      `Invalid credit card data: ${JSON.stringify(errors, null, 2)}`
    )
  }

  return creditCardData
}
