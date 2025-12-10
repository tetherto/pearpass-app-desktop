import { Validator } from 'pear-apps-utils-validator'

export const customFieldSchema = Validator.object({
  type: Validator.string().required(),
  note: Validator.string()
})

export const validateAndPrepareCustomFields = (customFields) => {
  const customFieldsData =
    customFields?.map((customField) => {
      if (customField.type === 'note') {
        return {
          type: 'note',
          note: customField.note
        }
      }

      throw new Error(`Invalid custom field type: ${customField.type}`)
    }) ?? []

  return customFieldsData
}
