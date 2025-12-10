import { MS_PER_WEEK } from 'pearpass-lib-constants'
/**
 * @param {{
 *  record: {
 *      updatedAt: number
 *  }
 * }}
 * @returns {boolean}
 */
export const isRecordInLast7Days = (record) => {
  const now = Date.now()
  const sevenDaysAgo = now - MS_PER_WEEK

  return record?.updatedAt >= sevenDaysAgo
}

/**
 * @param {{
 *  record: {
 *      updatedAt: number
 *  }
 * }}
 * @returns {boolean}
 */
export const isRecordInLast14Days = (record) => {
  const now = Date.now()
  const fourteenDaysAgo = now - MS_PER_WEEK * 2
  const sevenDaysAgo = now - MS_PER_WEEK

  return (
    record?.updatedAt >= fourteenDaysAgo && record?.updatedAt < sevenDaysAgo
  )
}

/**
 * @param {{
 *  record: {
 *   isFavorite: boolean,
 *   updatedAt: number
 *  },
 *  index: number,
 *  sortedRecords: Array<{
 *    isFavorite: boolean,
 *    updatedAt: number
 *  }>
 * }}
 * @returns {boolean}
 */
export const isStartOfLast7DaysGroup = (record, index, sortedRecords) => {
  const prevRecord = sortedRecords[index - 1]
  const prevIsFavorite = prevRecord?.isFavorite

  const isInLast7Days = isRecordInLast7Days(record)

  return !record?.isFavorite && isInLast7Days && (index === 0 || prevIsFavorite)
}

/**
 * @param {{
 *  record: {
 *      updatedAt: number
 *  },
 *   index: number,
 *   sortedRecords: Array<{
 *    isFavorite: boolean
 *    updatedAt: number
 *  }>
 * }}
 * @returns {boolean}
 */
export const isStartOfLast14DaysGroup = (record, index, sortedRecords) => {
  const prevRecord = sortedRecords[index - 1]
  const prevIsFavorite = prevRecord?.isFavorite
  const prevIsInLast7Days = prevRecord && isRecordInLast7Days(prevRecord)

  const isInLast14Days = isRecordInLast14Days(record)

  return (
    !record?.isFavorite &&
    isInLast14Days &&
    (index === 0 || prevIsFavorite || prevIsInLast7Days)
  )
}
