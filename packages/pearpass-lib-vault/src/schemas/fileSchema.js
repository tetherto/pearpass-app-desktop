import { Validator } from 'pear-apps-utils-validator'

export const fileSchema = Validator.object({
  id: Validator.string().required(),
  name: Validator.string().required()
})
