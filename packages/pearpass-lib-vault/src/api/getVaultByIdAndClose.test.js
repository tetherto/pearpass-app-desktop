import { jest } from '@jest/globals'

import { pearpassVaultClient } from '../instances'
import { checkVaultIsProtected } from './checkVaultIsProtected'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { getVaultById } from './getVaultById'
import { getVaultByIdAndClose } from './getVaultByIdAndClose'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'
import { logger } from '../utils/logger'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultGet: jest.fn()
  }
}))

jest.mock('./checkVaultIsProtected', () => ({
  checkVaultIsProtected: jest.fn()
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

jest.mock('./getVaultById', () => ({
  getVaultById: jest.fn()
}))

jest.mock('./initActiveVaultWithCredentials', () => ({
  initActiveVaultWithCredentials: jest.fn()
}))

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('getVaultByIdAndClose', () => {
  const currentVault = {
    id: 'cv1',
    encryption: { algo: 'protected-enc', salt: 'salt-cv' }
  }
  const masterEncryption = { algo: 'master-enc', salt: 'salt-master' }
  const vaultId = 'vault-123'
  const params = {
    password: 'p',
    ciphertext: 'c',
    nonce: 'n',
    hashedPassword: 'h'
  }
  const vaultData = { id: vaultId, data: 'some' }

  beforeEach(() => {
    jest.clearAllMocks()
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(currentVault)
    getMasterPasswordEncryption.mockResolvedValue(masterEncryption)
    checkVaultIsProtected.mockResolvedValue(true)
    getVaultById.mockResolvedValue(vaultData)
    initActiveVaultWithCredentials.mockResolvedValue(undefined)
  })

  test('uses current vault encryption when protected, initializes and returns vault', async () => {
    checkVaultIsProtected.mockResolvedValue(true)

    const result = await getVaultByIdAndClose(vaultId, params)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')

    expect(checkVaultIsProtected).toHaveBeenCalledWith(currentVault.id)
    expect(getVaultById).toHaveBeenCalledWith(vaultId, params)

    expect(initActiveVaultWithCredentials).toHaveBeenCalledTimes(1)
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      currentVault.id,
      currentVault.encryption
    )

    expect(logger.error).not.toHaveBeenCalled()
    expect(result).toBe(vaultData)
  })

  test('uses master encryption when vault is not protected', async () => {
    checkVaultIsProtected.mockResolvedValue(false)

    const result = await getVaultByIdAndClose(vaultId, params)

    expect(getMasterPasswordEncryption).toHaveBeenCalledTimes(1)
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      currentVault.id,
      masterEncryption
    )
    expect(result).toBe(vaultData)
  })

  test('on getVaultById error, reinitializes, logs error and throws standardized error', async () => {
    const underlyingError = new Error('boom')
    getVaultById.mockRejectedValueOnce(underlyingError)
    checkVaultIsProtected.mockResolvedValue(true)

    await expect(getVaultByIdAndClose(vaultId, params)).rejects.toThrow(
      'Error decrypting vault key'
    )

    expect(initActiveVaultWithCredentials).toHaveBeenCalledTimes(1)
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      currentVault.id,
      currentVault.encryption
    )

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      'Error fetching vault by ID:',
      underlyingError.message
    )
  })
})
