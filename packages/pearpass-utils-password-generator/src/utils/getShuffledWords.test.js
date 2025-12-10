import { getShuffledWords } from './getShuffledWords'
import { PASSPHRASE_WORD_LIST } from '../constants'

describe('getShuffledWords', () => {
  it('should return an array', () => {
    const result = getShuffledWords()
    expect(Array.isArray(result)).toBe(true)
  })

  it('should return an array with the same length as PASSPHRASE_WORD_LIST', () => {
    const result = getShuffledWords()
    expect(result.length).toBe(PASSPHRASE_WORD_LIST.length)
  })

  it('should return an array containing the same elements as PASSPHRASE_WORD_LIST', () => {
    const result = getShuffledWords()
    expect(result.sort()).toEqual([...PASSPHRASE_WORD_LIST].sort())
  })

  it('should return a shuffled version of PASSPHRASE_WORD_LIST', () => {
    const result = getShuffledWords()

    const isShuffled = result.some(
      (word, index) => word !== PASSPHRASE_WORD_LIST[index]
    )
    expect(isShuffled).toBe(true)
  })
})
