import { checkPassphraseStrength } from './passphrase'

describe('checkPassphraseStrength', () => {
  // Existing tests...

  it('should return empty errors array when all rules pass', () => {
    const words = [
      'Test1!',
      'Word2@',
      'Example3#',
      'Unique',
      'Safe',
      'Pass',
      'Phrase',
      'Another4$'
    ]
    const result = checkPassphraseStrength(words)
    expect(result.errors).toEqual([])
  })

  it('should return custom error messages for failed rules', () => {
    const words = ['test', 'test']
    const config = {
      rules: { words: 3, capitalLetters: true },
      errors: {
        minWords: 'Not enough words',
        uniqueWords: 'Duplicate words',
        capitalLetters: 'No capital letter'
      }
    }
    const result = checkPassphraseStrength(words, config)
    expect(result.errors).toContain('Not enough words')
    expect(result.errors).toContain('Duplicate words')
    expect(result.errors).toContain('No capital letter')
  })

  it('should handle empty words array', () => {
    const result = checkPassphraseStrength([])
    expect(result.rules.minWords).toBe(false)
    expect(result.rules.uniqueWords).toBe(true)
    expect(result.rules.capitalLetters).toBe(false)
    expect(result.rules.symbols).toBe(false)
    expect(result.rules.numbers).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should treat undefined config as default', () => {
    const words = [
      'Test1!',
      'Word2@',
      'Example3#',
      'Unique',
      'Safe',
      'Pass',
      'Phrase',
      'Another4$'
    ]
    const result = checkPassphraseStrength(words, undefined)
    expect(result.rules.minWords).toBe(true)
    expect(result.rules.uniqueWords).toBe(true)
  })

  it('should handle words with only symbols and numbers', () => {
    const words = ['123!', '@#$%', '456^', '&*()', '789*', '000!', '!!!', '###']
    const result = checkPassphraseStrength(words)
    expect(result.rules.capitalLetters).toBe(false)
    expect(result.rules.symbols).toBe(true)
    expect(result.rules.numbers).toBe(true)
    expect(result.rules.uniqueWords).toBe(false)
  })

  it('should handle words with mixed case and special characters', () => {
    const words = [
      'Abc1!',
      'Def2@',
      'Ghi3#',
      'Jkl4$',
      'Mno5%',
      'Pqr6^',
      'Stu7&',
      'Vwx8*'
    ]
    const result = checkPassphraseStrength(words)
    expect(result.rules.capitalLetters).toBe(true)
    expect(result.rules.symbols).toBe(true)
    expect(result.rules.numbers).toBe(true)
    expect(result.rules.uniqueWords).toBe(true)
    expect(result.rules.minWords).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should fail all rules if words array is empty', () => {
    const result = checkPassphraseStrength([], {
      rules: { capitalLetters: true, symbols: true, numbers: true, words: 3 }
    })
    expect(result.rules.minWords).toBe(false)
    expect(result.rules.uniqueWords).toBe(true)
    expect(result.rules.capitalLetters).toBe(false)
    expect(result.rules.symbols).toBe(false)
    expect(result.rules.numbers).toBe(false)
  })

  it('should pass all rules if all are disabled', () => {
    const words = ['a', 'a', 'a']
    const result = checkPassphraseStrength(words, {
      rules: { capitalLetters: false, symbols: false, numbers: false, words: 1 }
    })

    expect(result.rules.uniqueWords).toBe(false)
    expect(result.rules.minWords).toBe(true)
    expect(result.rules.capitalLetters).toBe(true)
    expect(result.rules.symbols).toBe(true)
    expect(result.rules.numbers).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should handle config with only some rules specified', () => {
    const words = ['Test1', 'Word2', 'Example3']
    const result = checkPassphraseStrength(words, { rules: { words: 3 } })
    expect(result.rules.minWords).toBe(true)
    expect(result.rules.capitalLetters).toBe(true)
    expect(result.rules.symbols).toBe(false)
    expect(result.rules.numbers).toBe(true)
  })

  it('should ignore extra properties in config', () => {
    const words = [
      'Test1!',
      'Word2@',
      'Example3#',
      'Unique',
      'Safe',
      'Pass',
      'Phrase',
      'Another4$'
    ]
    const result = checkPassphraseStrength(words, {
      foo: 'bar',
      rules: { words: 8 }
    })
    expect(result.rules.minWords).toBe(true)
    expect(result.rules.uniqueWords).toBe(true)
  })
})
