import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'
import { Validator } from 'pear-apps-utils-validator'

export const recordSchema = Validator.object({
  id: Validator.string().required(),
  vaultId: Validator.string().required(),
  folder: Validator.string().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

/**
 * Creates a folder record
 * @param {string} folderName
 * @param {string} vaultId
 * @returns {object}
 */
export const createFolderFactory = (folderName, vaultId) => {
  if (!folderName) {
    throw new Error('Folder name is required')
  }

  if (!vaultId) {
    throw new Error('Vault ID is required')
  }

  const record = {
    id: generateUniqueId(),
    vaultId: vaultId,
    folder: folderName,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const errors = recordSchema.validate(record)

  if (errors) {
    throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)
  }

  return record
}
