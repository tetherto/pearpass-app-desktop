import { PASSPHRASE_WORD_LIST } from '../constants'

/**
 * @returns {Array<string>}
 */
export const getShuffledWords = () =>
  [...PASSPHRASE_WORD_LIST].sort(() => Math.random() - 0.5)
