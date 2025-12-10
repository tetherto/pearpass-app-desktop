import { init } from './init'
import { initWithCredentials } from './initWithCredentials'
import { initWithPassword } from './initWithPassword'

jest.mock('./initWithCredentials')
jest.mock('./initWithPassword')

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls initWithCredentials when ciphertext, nonce, and hashedPassword are provided', async () => {
    initWithCredentials.mockResolvedValue(true)
    const params = {
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      hashedPassword: 'hashedPassword'
    }
    const result = await init(params)
    expect(initWithCredentials).toHaveBeenCalledWith({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      hashedPassword: 'hashedPassword'
    })
    expect(result).toBe(true)
    expect(initWithPassword).not.toHaveBeenCalled()
  })

  it('calls initWithPassword when only password is provided', async () => {
    initWithPassword.mockResolvedValue(true)
    const params = {
      password: 'myPassword'
    }
    const result = await init(params)
    expect(initWithPassword).toHaveBeenCalledWith({
      password: 'myPassword'
    })
    expect(result).toBe(true)
    expect(initWithCredentials).not.toHaveBeenCalled()
  })

  it('throws error when neither credentials nor password are provided', async () => {
    await expect(init({})).rejects.toThrow(
      'Either password or credentials are required'
    )
    expect(initWithCredentials).not.toHaveBeenCalled()
    expect(initWithPassword).not.toHaveBeenCalled()
  })

  it('prefers credentials over password if both are provided', async () => {
    initWithCredentials.mockResolvedValue('credResult')
    const params = {
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      hashedPassword: 'hashedPassword',
      password: 'myPassword'
    }
    const result = await init(params)
    expect(initWithCredentials).toHaveBeenCalledWith({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      hashedPassword: 'hashedPassword'
    })
    expect(result).toBe('credResult')
    expect(initWithPassword).not.toHaveBeenCalled()
  })
})
