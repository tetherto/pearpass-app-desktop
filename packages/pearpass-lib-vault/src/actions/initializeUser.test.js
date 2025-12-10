import { initializeUser } from './initializeUser'
import { getMasterPasswordEncryption } from '../api/getMasterPasswordEncryption'
import { pearpassVaultClient } from '../instances'

jest.mock('../api/getMasterPasswordEncryption')
jest.mock('../instances', () => ({
  pearpassVaultClient: {
    vaultsGetStatus: jest.fn(),
    activeVaultGetStatus: jest.fn(),
    getMasterPasswordStatus: jest.fn()
  }
}))

describe('initializeUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pearpassVaultClient.getMasterPasswordStatus.mockResolvedValue(null)
  })

  it('should call all required API methods', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      salt: 'test-salt'
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })

    const dispatch = jest.fn()
    const getState = jest.fn()

    await initializeUser()(dispatch, getState)

    expect(getMasterPasswordEncryption).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalledTimes(1)
  })

  it('should return correct state when all conditions are met', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      salt: 'test-salt'
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result = await initializeUser()(dispatch, getState)

    expect(result.payload).toEqual({
      hasPasswordSet: true,
      isLoggedIn: true,
      isVaultOpen: true,
      masterPasswordStatus: null
    })
  })

  it('should return hasPasswordSet as false when encryption fields are missing', async () => {
    getMasterPasswordEncryption.mockResolvedValue(null)
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result = await initializeUser()(dispatch, getState)

    expect(result.payload).toEqual({
      hasPasswordSet: false,
      isLoggedIn: true,
      isVaultOpen: true,
      masterPasswordStatus: null
    })
  })

  it('should return isLoggedIn as false when vaultsGetStatus fails', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      salt: 'test-salt'
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue(null)
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result = await initializeUser()(dispatch, getState)

    expect(result.payload).toEqual({
      hasPasswordSet: true,
      isLoggedIn: false,
      isVaultOpen: false,
      masterPasswordStatus: null
    })
  })

  it('should return isVaultOpen as false when activeVaultGetStatus fails', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      salt: 'test-salt'
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue(null)

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result = await initializeUser()(dispatch, getState)

    expect(result.payload).toEqual({
      hasPasswordSet: true,
      isLoggedIn: true,
      isVaultOpen: false,
      masterPasswordStatus: null
    })
  })
})
