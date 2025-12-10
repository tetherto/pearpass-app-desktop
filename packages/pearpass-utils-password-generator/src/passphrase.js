import { SPECIAL_CHARS } from './constants'
import { getShuffledWords } from './utils/getShuffledWords'

/**
 * @param {boolean} capitalLetters
 * @param {boolean} symbols
 * @param {boolean} numbers
 * @param {number} wordsCount
 * @returns {Array<string>}
 */
export const generatePassphrase = (
  capitalLetters,
  symbols,
  numbers,
  wordsCount
) => {
  const selectedWords = getShuffledWords().slice(0, wordsCount)

  const passphrase = selectedWords.map((word) => {
    if (capitalLetters) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }

    if (numbers) {
      word += Math.floor(Math.random() * 10)
    }

    if (symbols) {
      word += SPECIAL_CHARS.charAt(
        Math.floor(Math.random() * SPECIAL_CHARS.length)
      )
    }

    return word
  })

  return passphrase
}
