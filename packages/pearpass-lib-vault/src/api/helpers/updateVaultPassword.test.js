import { updateVaultPassword } from './updateVaultPassword'
import { pearpassVaultClient } from '../../instances'
import { initActiveVaultWithCredentials } from '../initActiveVaultWithCredentials'

jest.mock('../../instances', () => ({
  pearpassVaultClient: {
    hashPassword: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    activeVaultAdd: jest.fn(),
    vaultsAdd: jest.fn()
  }
}))
jest.mock('../initActiveVaultWithCredentials', () => ({
  initActiveVaultWithCredentials: jest.fn()
}))

describe('updateVaultPassword', () => {
  const vault = { id: 'vault123', encryption: {} }
  const password = 'newPassword'
  const hashedPassword = 'hashed'
  const salt = 'salt'
  const ciphertext = 'ciphertext'
  const nonce = 'nonce'

  beforeEach(() => {
    jest.clearAllMocks()
    pearpassVaultClient.hashPassword.mockResolvedValue({ hashedPassword, salt })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext,
      nonce
    })
    pearpassVaultClient.activeVaultAdd.mockResolvedValue()
    pearpassVaultClient.vaultsAdd.mockResolvedValue()
    initActiveVaultWithCredentials.mockResolvedValue()
  })

  it('updates vault password and calls all required methods', async () => {
    await updateVaultPassword(password, vault)

    expect(pearpassVaultClient.hashPassword).toHaveBeenCalledWith(password)
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).toHaveBeenCalledWith(hashedPassword)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      expect.objectContaining({
        id: vault.id,
        encryption: { ciphertext, nonce, salt, hashedPassword }
      })
    )
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      expect.objectContaining({
        id: vault.id,
        encryption: { ciphertext, nonce, salt }
      })
    )
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(vault.id, {
      hashedPassword,
      salt,
      ciphertext,
      nonce
    })
  })

  it('throws error if password is missing', async () => {
    await expect(updateVaultPassword('', vault)).rejects.toThrow(
      'Password is required'
    )
    await expect(updateVaultPassword(undefined, vault)).rejects.toThrow(
      'Password is required'
    )
  })

  it('throws error if initActiveVaultWithCredentials fails', async () => {
    initActiveVaultWithCredentials.mockRejectedValue(new Error('Init failed'))
    await expect(updateVaultPassword(password, vault)).rejects.toThrow(
      'Init failed'
    )
  })
})
