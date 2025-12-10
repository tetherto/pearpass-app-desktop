import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

/**
 * @param {{id: string, buffer: ArrayBuffer}[]} files
 * @returns {{
 *  files: {id: string}[],
 *  buffersWithId: {id: string, buffer: ArrayBuffer}[]
 * }}
 */
export const processFiles = (files = []) =>
  files.reduce(
    (acc, file) => {
      if (!file) {
        return acc
      }

      if (file.id) {
        acc.files.push({ id: file.id, name: file.name })
      } else {
        const fileId = generateUniqueId()

        acc.buffersWithId.push({
          id: fileId,
          buffer: file.buffer,
          name: file.name
        })
        acc.files.push({ id: fileId, name: file.name || `file-${fileId}` })
      }
      return acc
    },
    { files: [], buffersWithId: [] }
  )
