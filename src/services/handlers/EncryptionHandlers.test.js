import { EncryptionHandlers } from './EncryptionHandlers'

describe('EncryptionHandlers', () => {
  let clientMock
  let handlers

  beforeEach(() => {
    clientMock = {
      encryptionGetStatus: jest.fn()
    }
    handlers = new EncryptionHandlers(clientMock)
  })

  it('should call client.encryptionGetStatus and return its result', async () => {
    const status = { enabled: true }
    clientMock.encryptionGetStatus.mockResolvedValue(status)

    const result = await handlers.encryptionGetStatus()

    expect(clientMock.encryptionGetStatus).toHaveBeenCalledTimes(1)
    expect(result).toBe(status)
  })

  it('should propagate errors from client.encryptionGetStatus', async () => {
    const error = new Error('Failed to get status')
    clientMock.encryptionGetStatus.mockRejectedValue(error)

    await expect(handlers.encryptionGetStatus()).rejects.toThrow(
      'Failed to get status'
    )
  })
})
