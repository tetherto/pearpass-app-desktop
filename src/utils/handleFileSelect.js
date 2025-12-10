import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { logger } from './logger'
import { readFileContent } from '../pages/SettingsView/ImportTab/utils/readFileContent'

/**
 * @param {Object} params
 * @param {FileList} params.files
 * @param {string} params.fieldName
 * @param {(string, { buffer: Uint8Array, name: string, tempId: string }[]) => void} params.setValue
 * @param {Object} params.values
 *
 * @returns {void}
 */
export const handleFileSelect = ({ files, fieldName, setValue, values }) => {
  const file = files[0]
  const filename = file.name
  readFileContent(file, { as: 'buffer' })
    .then(async (arrayBuffer) => {
      const uint8Buffer = new Uint8Array(arrayBuffer)

      setValue(fieldName, [
        ...values[fieldName],
        { buffer: uint8Buffer, name: filename, tempId: generateUniqueId() }
      ])
    })
    .catch((e) => {
      logger.error('useGetMultipleFiles', 'Error reading file:', e)
    })
}
