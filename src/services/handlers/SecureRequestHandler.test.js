jest.mock('sodium-native', () => ({
  crypto_sign_keypair: jest.fn(),
  crypto_sign_ed25519_pk_to_curve25519: jest.fn(),
  crypto_sign_ed25519_sk_to_curve25519: jest.fn(),
  crypto_kx_keypair: jest.fn(),
  crypto_kx_server_session_keys: jest.fn(),
  crypto_kx_client_session_keys: jest.fn(),
  crypto_secretbox_easy: jest.fn(),
  crypto_secretbox_open_easy: jest.fn(),
  randombytes_buf: jest.fn(),
  sodium_malloc: jest.fn((size) => Buffer.alloc(size)),
  crypto_sign_PUBLICKEYBYTES: 32,
  crypto_sign_SECRETKEYBYTES: 64,
  crypto_kx_PUBLICKEYBYTES: 32,
  crypto_kx_SECRETKEYBYTES: 32,
  crypto_kx_SESSIONKEYBYTES: 32,
  crypto_secretbox_NONCEBYTES: 24,
  crypto_secretbox_MACBYTES: 16
}))

import { SecureRequestHandler } from './SecureRequestHandler'
import { logger } from '../../utils/logger'
import * as sessionManager from '../security/sessionManager.js'
import * as sessionStore from '../security/sessionStore.js'

jest.mock('../../utils/logger')
jest.mock('../security/sessionManager.js')
jest.mock('../security/sessionStore.js')

describe('SecureRequestHandler.handle', () => {
  let handler
  let mockClient
  let mockMethodRegistry

  beforeEach(() => {
    mockClient = {}
    mockMethodRegistry = {
      execute: jest.fn()
    }
    handler = new SecureRequestHandler(mockClient, mockMethodRegistry)
    jest.clearAllMocks()
  })

  it('should process a valid secure request and return encrypted response', async () => {
    const params = {
      sessionId: 'session123',
      nonceB64: Buffer.from('nonce').toString('base64'),
      ciphertextB64: Buffer.from('ciphertext').toString('base64'),
      seq: 42
    }

    // Mock session
    sessionStore.getSession.mockReturnValue({ id: 'session123' })
    sessionManager.recordIncomingSeq.mockImplementation(() => {})
    // Mock decryption
    const decryptedRequest = { method: 'testMethod', params: { foo: 'bar' } }
    sessionManager.decryptWithSession.mockReturnValue(
      Buffer.from(JSON.stringify(decryptedRequest), 'utf8')
    )
    // Mock method execution
    mockMethodRegistry.execute.mockResolvedValue('methodResult')
    // Mock encryption
    sessionManager.encryptWithSession.mockResolvedValue('encryptedResponse')

    const result = await handler.handle(params)

    expect(sessionStore.getSession).toHaveBeenCalledWith('session123')
    expect(sessionManager.recordIncomingSeq).toHaveBeenCalledWith(
      'session123',
      42
    )
    expect(sessionManager.decryptWithSession).toHaveBeenCalled()
    expect(mockMethodRegistry.execute).toHaveBeenCalledWith(
      'testMethod',
      { foo: 'bar' },
      { client: mockClient }
    )
    expect(sessionManager.encryptWithSession).toHaveBeenCalled()
    expect(result).toBe('encryptedResponse')
    expect(logger.debug).toHaveBeenCalledWith(
      'SECURE-REQUEST',
      'Received method: testMethod'
    )
  })

  it('should throw InvalidSecurePayload if payload is missing fields', async () => {
    await expect(handler.handle({})).rejects.toThrow('InvalidSecurePayload')
  })

  it('should throw SessionNotFound if session does not exist', async () => {
    sessionStore.getSession.mockReturnValue(undefined)
    const params = {
      sessionId: 'bad-session',
      nonceB64: 'nonce',
      ciphertextB64: 'ciphertext',
      seq: 1
    }
    await expect(handler.handle(params)).rejects.toThrow('SessionNotFound')
  })
})
