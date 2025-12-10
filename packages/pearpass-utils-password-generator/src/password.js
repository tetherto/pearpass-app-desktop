import { DIGITS, LOWER_CASE, SPECIAL_CHARS, UPPER_CASE } from './constants'

/**
 * @param {number} length
 * @param {boolean} includeSpecialChars
 * @returns {string}
 */
export const generatePassword = (length, rulesConfig = {}) => {
  const {
    includeSpecialChars = true,
    lowerCase = true,
    upperCase = true,
    numbers = true
  } = rulesConfig

  let characters = ''
  let password = ''

  if (lowerCase) {
    characters += LOWER_CASE
    password += LOWER_CASE[Math.floor(Math.random() * LOWER_CASE.length)]
  }

  if (upperCase) {
    characters += UPPER_CASE
    password += UPPER_CASE[Math.floor(Math.random() * UPPER_CASE.length)]
  }

  if (numbers) {
    characters += DIGITS
    password += DIGITS[Math.floor(Math.random() * DIGITS.length)]
  }

  if (includeSpecialChars) {
    characters += SPECIAL_CHARS
    password += SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)]
  }

  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    password += characters[randomIndex]
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}
