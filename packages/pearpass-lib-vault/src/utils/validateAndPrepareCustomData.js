import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'
import { fileSchema } from '../schemas/fileSchema'

export const customSchema = Validator.object({
  title: Validator.string().required(),
  customFields: Validator.array().items(customFieldSchema),
  attachments: Validator.array().items(fileSchema)
})

export const validateAndPrepareCustomData = (custom) => {
  const customData = {
    title: custom.title,
    customFields: validateAndPrepareCustomFields(custom.customFields),
    attachments: custom.attachments
  }

  const errors = customSchema.validate(customData)

  if (errors) {
    throw new Error(`Invalid custom data: ${JSON.stringify(errors, null, 2)}`)
  }

  return customData
}
