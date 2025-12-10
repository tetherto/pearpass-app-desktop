import { extractIds } from './extractIds'

/**
 * @param {Object} record
 * @param {Object} [record.data]
 * @param {Array} [record.data.attachments]
 * @param {string} [record.type]
 * @param {Array} [record.data.passportPicture]
 * @param {Array} [record.data.idCardPicture]
 * @param {Array} [record.data.drivingLicensePicture]
 * @returns {Array}
 */
export const extractFileIdsFromRecord = (record) => {
  let fileIds = [...extractIds(record.data?.attachments)]

  if (record.type === 'identity') {
    const passportIds = extractIds(record.data?.passportPicture)
    const idCardIds = extractIds(record.data?.idCardPicture)
    const drivingLicenseIds = extractIds(record.data?.drivingLicensePicture)

    fileIds = fileIds.concat(passportIds, idCardIds, drivingLicenseIds)
  }

  return fileIds
}
