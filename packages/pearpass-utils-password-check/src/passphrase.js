import { PASSWORD_STRENGTH } from './constants'
import { getPassStrength } from './utils/getPassStrength'
import { getStrengthDisplay } from './utils/getStrengthDisplay'

/**
 * @param {Array<string>} wordsArray
 * @param {{ rules: { capitalLetters?: boolean, symbols?: boolean, numbers?: boolean, words?: number }, errors?: Record<string, string> }} config
 * @returns {{
 *  success: boolean,
 *  type: "vulnerable" | "weak" | "safe",
 *  strengthType: 'error' | 'warning' | 'success',
 *  strengthText: string,
 *  rules: Record<string, boolean>,
 *  errors: string[]
 * }}
 */
export const checkPassphraseStrength = (wordsArray, config = {}) => {
  const { rules = {}, errors = {} } = config

  const {
    capitalLetters = true,
    symbols = true,
    numbers = true,
    words = 8
  } = rules

  const rulesCheck = {
    minWords: wordsArray?.length >= words,
    uniqueWords:
      new Set(wordsArray.map((word) => word.replace(/[^a-zA-Z]/g, ''))).size ===
      wordsArray.length,
    capitalLetters: capitalLetters ? /[A-Z]/.test(wordsArray.join('')) : true,
    symbols: symbols
      ? /[!@#$%^&*(),.?":{}|<>]/.test(wordsArray.join(''))
      : true,
    numbers: numbers ? /\d/.test(wordsArray.join('')) : true
  }

  const failedRules = Object.keys(rulesCheck).filter(
    (rule) => !rulesCheck[rule]
  )
  const errorMessages = failedRules.map((rule) => errors[rule])
  const type = getPassStrength(rulesCheck)
  const strengthDisplay = getStrengthDisplay(type)

  return {
    success: type === PASSWORD_STRENGTH.SAFE && errorMessages.length === 0,
    type,
    strengthType: strengthDisplay.type,
    strengthText: strengthDisplay.text,
    rules: rulesCheck,
    errors: errorMessages
  }
}
