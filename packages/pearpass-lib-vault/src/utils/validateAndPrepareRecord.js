import { Validator } from 'pear-apps-utils-validator'

import { logger } from './logger'
import { validateAndPrepareCreditCardData } from './validateAndPrepareCreditCardData'
import { validateAndPrepareCustomData } from './validateAndPrepareCustomData'
import { validateAndPrepareIdentityData } from './validateAndPrepareIdentityData'
import { validateAndPrepareLoginData } from './validateAndPrepareLoginData'
import { validateAndPrepareNoteData } from './validateAndPrepareNoteData'
import { validateAndPreparePassPhraseData } from './validateAndPreparePassPhraseData'
import { validateAndPrepareWifiPasswordData } from './validateAndPrepareWifiPasswordData'
import { RECORD_TYPES } from '../constants/recordTypes'
import { VERSION } from '../constants/version'

const {
  CREDIT_CARD,
  CUSTOM,
  IDENTITY,
  LOGIN,
  NOTE,
  WIFI_PASSWORD,
  PASS_PHRASE
} = RECORD_TYPES

export const recordSchema = Validator.object({
  id: Validator.string().required(),
  version: Validator.number().required(),
  type: Validator.string().required(),
  vaultId: Validator.string().required(),
  folder: Validator.string(),
  isFavorite: Validator.boolean().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

/**
 * @param {Object} record
 * @returns {Object}
 * @throws {Error}
 */
const validateRecord = (record) => {
  if (!record || typeof record !== 'object') {
    logger.error('Invalid record data: Record must be an object')

    throw new Error('Invalid record data: Record must be an object')
  }

  const validTypes = [
    CREDIT_CARD,
    CUSTOM,
    IDENTITY,
    LOGIN,
    NOTE,
    WIFI_PASSWORD,
    PASS_PHRASE
  ]

  if (!validTypes.includes(record.type)) {
    logger.error(`Invalid record data: Unknown record type "${record.type}"`)
    throw new Error(`Invalid record data: Unknown record type "${record.type}"`)
  }

  const errors = recordSchema.validate(record)

  if (errors) {
    logger.error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)

    throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)
  }

  return record
}

/**
 * @param {Object} record
 * @returns {Object}
 * @throws {Error}
 */
export const validateAndPrepareRecord = (record) => {
  let recordData

  if (record.type === CREDIT_CARD) {
    recordData = validateAndPrepareCreditCardData(record.data)
  }

  if (record.type === CUSTOM) {
    recordData = validateAndPrepareCustomData(record.data)
  }

  if (record.type === IDENTITY) {
    recordData = validateAndPrepareIdentityData(record.data)
  }

  if (record.type === LOGIN) {
    recordData = validateAndPrepareLoginData(record.data)
  }

  if (record.type === NOTE) {
    recordData = validateAndPrepareNoteData(record.data)
  }
  if (record.type === WIFI_PASSWORD) {
    recordData = validateAndPrepareWifiPasswordData(record.data)
  }
  if (record.type === PASS_PHRASE) {
    recordData = validateAndPreparePassPhraseData(record.data)
  }

  return validateRecord({
    id: record.id,
    version: VERSION.v1,
    type: record.type,
    vaultId: record.vaultId,
    data: recordData,
    folder: record.folder || null,
    isFavorite: record.isFavorite,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  })
}
