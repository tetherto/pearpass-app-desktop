import { extractIds } from './extractIds'

/**
 * @param {{id: string}[]} newFiles
 * @param {{id: string}[]} currentFiles
 * @returns {string[]}
 */
const getDeletedFileIds = (newFiles = [], currentFiles = []) => {
  const newFileIds = extractIds(newFiles)
  return extractIds(currentFiles).filter(
    (fileId) => !newFileIds.includes(fileId)
  )
}

/**
 * @param {{newRecord: Object, currentRecord: Object}} params
 * @returns {string[]}
 * @throws {Error}
 */
export const extractDeletedIdsFromRecord = ({ newRecord, currentRecord }) => {
  if (!currentRecord) throw new Error('Current record is required')

  if (newRecord.id !== currentRecord.id) {
    throw new Error('New record ID does not match current record ID')
  }

  let fileIds = [
    ...getDeletedFileIds(
      newRecord.data?.attachments,
      currentRecord.data?.attachments
    )
  ]

  if (newRecord.type === 'identity') {
    const passportIds = getDeletedFileIds(
      newRecord.data?.passportPicture,
      currentRecord.data?.passportPicture
    )
    const idCardIds = getDeletedFileIds(
      newRecord.data?.idCardPicture,
      currentRecord.data?.idCardPicture
    )
    const drivingLicenseIds = getDeletedFileIds(
      newRecord.data?.drivingLicensePicture,
      currentRecord.data?.drivingLicensePicture
    )

    fileIds = fileIds.concat(passportIds, idCardIds, drivingLicenseIds)
  }

  return fileIds
}
