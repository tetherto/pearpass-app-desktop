import { handleErrorIfExists } from './handleError'

describe('handleErrorIfExists', () => {
  it('should not throw when error is falsy', () => {
    expect(() => handleErrorIfExists(null)).not.toThrow()
    expect(() => handleErrorIfExists(undefined)).not.toThrow()
    expect(() => handleErrorIfExists(false)).not.toThrow()
    expect(() => handleErrorIfExists(0)).not.toThrow()
    expect(() => handleErrorIfExists('')).not.toThrow()
  })

  it('should throw an error with the error message when error has a message property', () => {
    const error = new Error('Test error message')

    expect(() => handleErrorIfExists(error)).toThrow('Test error message')
  })

  it('should call callback with the error when error exists and callback is provided', () => {
    const error = new Error('Test error')
    const callback = jest.fn()

    try {
      handleErrorIfExists(error, callback)
    } catch {}

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.any(Error))
    expect(callback.mock.calls[0][0].message).toBe('Test error')
  })

  it('should not call callback when error is falsy', () => {
    const callback = jest.fn()

    handleErrorIfExists(null, callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not throw when callback is not provided and error is falsy', () => {
    expect(() => handleErrorIfExists(null)).not.toThrow()
  })

  it('should handle error object with message property', () => {
    const error = { message: 'Custom error message' }

    expect(() => handleErrorIfExists(error)).toThrow('Custom error message')
  })

  it('should create a new Error instance with the extracted message', () => {
    const error = new Error('Original error')
    const callback = jest.fn()
    let thrownError

    try {
      handleErrorIfExists(error, callback)
    } catch (e) {
      thrownError = e
    }

    expect(thrownError).toBeInstanceOf(Error)
    expect(thrownError).not.toBe(error)
    expect(thrownError.message).toBe('Original error')
  })
})
