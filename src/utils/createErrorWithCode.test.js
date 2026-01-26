import { createErrorWithCode } from './createErrorWithCode'

describe('createErrorWithCode', () => {
  it('creates error message with code prefix', () => {
    const result = createErrorWithCode('ErrorCode', 'Something went wrong')
    expect(result).toBe('ErrorCode: Something went wrong')
  })

  it('handles empty message', () => {
    const result = createErrorWithCode('ErrorCode', '')
    expect(result).toBe('ErrorCode: ')
  })

  it('handles messages with special characters', () => {
    const result = createErrorWithCode('ErrorCode', 'Error: $pecial ch@rs!')
    expect(result).toBe('ErrorCode: Error: $pecial ch@rs!')
  })
})
