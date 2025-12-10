import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'
import { fileSchema } from '../schemas/fileSchema'

export const noteSchema = Validator.object({
  title: Validator.string().required(),
  note: Validator.string(),
  customFields: Validator.array().items(customFieldSchema),
  attachments: Validator.array().items(fileSchema)
})

export const validateAndPrepareNoteData = (note) => {
  const noteData = {
    title: note.title,
    note: note.note,
    customFields: validateAndPrepareCustomFields(note.customFields),
    attachments: note.attachments
  }

  const errors = noteSchema.validate(noteData)

  if (errors) {
    throw new Error(`Invalid note data: ${JSON.stringify(errors, null, 2)}`)
  }

  return noteData
}
