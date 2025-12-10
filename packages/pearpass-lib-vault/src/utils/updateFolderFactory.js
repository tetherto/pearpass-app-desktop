/**
 *
 * @param {string[]} recordIds
 * @param {string} folder
 * @param {{
 *  data: {
 *    records: {
 *     id: string
 *    }[]
 * }} vault
 * @returns {Object[]}
 */
export const updateFolderFactory = (recordIds, folder, vault) => {
  if (!recordIds || !Array.isArray(recordIds)) {
    throw new Error('Record IDs must be an array')
  }

  if (!folder.length) {
    throw new Error('Folder name is required')
  }

  if (!vault?.data?.records) {
    throw new Error('Invalid vault data')
  }

  const records = recordIds
    .reduce((acc, id) => {
      const foundRecord = vault.data.records.find((r) => r.id === id)

      if (foundRecord) {
        acc.push({
          ...foundRecord,
          folder
        })
      }

      return acc
    }, [])
    .filter((record) => record !== undefined)

  return records
}
