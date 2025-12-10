import { generatePassword } from './password'

describe('generatePassword', () => {
  test('returns a string with specified length', () => {
    const password = generatePassword(12)
    expect(password).toHaveLength(12)
  })

  test('includes special characters when includeSpecialChars is true', () => {
    const password = generatePassword(20, { includeSpecialChars: true })
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
    expect(specialCharsRegex.test(password)).toBe(true)
  })

  test('excludes special characters when includeSpecialChars is false', () => {
    const password = generatePassword(20, { includeSpecialChars: false })
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
    expect(specialCharsRegex.test(password)).toBe(false)
  })

  test('includes lowercase when lowerCase is true', () => {
    const password = generatePassword(20, { lowerCase: true })
    const lowerCaseRegex = /[a-z]+/
    expect(lowerCaseRegex.test(password)).toBe(true)
  })

  test('excludes lowercase when lowerCase is false', () => {
    const password = generatePassword(20, { lowerCase: false })
    const lowerCaseRegex = /[a-z]+/
    expect(lowerCaseRegex.test(password)).toBe(false)
  })

  test('includes uppercase when upperCase is true', () => {
    const password = generatePassword(20, { upperCase: true })
    const upperCaseRegex = /[A-Z]+/
    expect(upperCaseRegex.test(password)).toBe(true)
  })

  test('excludes uppercase when upperCase is false', () => {
    const password = generatePassword(20, { upperCase: false })
    const upperCaseRegex = /[A-Z]+/
    expect(upperCaseRegex.test(password)).toBe(false)
  })

  test('includes numbers when numbers is true', () => {
    const password = generatePassword(20, { numbers: true })
    const numbersRegex = /[0-9]+/
    expect(numbersRegex.test(password)).toBe(true)
  })

  test('excludes numbers when numbers is false', () => {
    const password = generatePassword(20, { numbers: false })
    const numbersRegex = /[0-9]+/
    expect(numbersRegex.test(password)).toBe(false)
  })

  test('generates different passwords on consecutive calls', () => {
    const password1 = generatePassword(12)
    const password2 = generatePassword(12)
    expect(password1).not.toEqual(password2)
  })

  test('handles minimum requirements when all options are true', () => {
    const password = generatePassword(4, {
      includeSpecialChars: true,
      lowerCase: true,
      upperCase: true,
      numbers: true
    })

    expect(password).toHaveLength(4)
    expect(/[a-z]+/.test(password)).toBe(true)
    expect(/[A-Z]+/.test(password)).toBe(true)
    expect(/[0-9]+/.test(password)).toBe(true)
    expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)).toBe(true)
  })

  test('handles minimum length with limited options', () => {
    const password = generatePassword(2, {
      includeSpecialChars: false,
      lowerCase: true,
      upperCase: false,
      numbers: false
    })

    expect(password).toHaveLength(2)
    const lowerCaseRegex = /^[a-z]+$/
    expect(lowerCaseRegex.test(password)).toBe(true)
  })
})
