const { __validateRef } = require('pear-apps-utils-validator')

const { updateProtectedVault } = require('./updateProtectedVault')
const { getVaultByIdAndClose } = require('../api/getVaultByIdAndClose')
const {
  updateProtectedVault: updateProtectedVaultApi
} = require('../api/updateProtectedVault')

jest.mock('@reduxjs/toolkit', () => ({
  createAsyncThunk: (_type, payloadCreator) => payloadCreator
}))

jest.mock('pear-apps-utils-validator', () => {
  const validateRef = { fn: () => null }
  const chain = () => ({ required: jest.fn(() => ({})) })
  return {
    Validator: {
      object: jest.fn(() => ({
        validate: (...args) => validateRef.fn(...args)
      })),
      string: jest.fn(() => chain()),
      number: jest.fn(() => chain())
    },
    __validateRef: validateRef
  }
})

jest.mock('../api/getVaultByIdAndClose', () => ({
  getVaultByIdAndClose: jest.fn()
}))

jest.mock('../api/updateProtectedVault', () => ({
  updateProtectedVault: jest.fn()
}))

describe('updateProtectedVault', () => {
  let dateNowSpy

  beforeEach(() => {
    jest.clearAllMocks()
    __validateRef.fn = jest.fn(() => null)
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(2000)
  })

  afterEach(() => {
    dateNowSpy.mockRestore()
  })

  test('updates protected vault with valid data', async () => {
    getVaultByIdAndClose.mockResolvedValue({
      id: 'old-id',
      name: 'Old Name',
      version: 2,
      createdAt: 1000,
      updatedAt: 1500,
      extra: 'z'
    })

    await updateProtectedVault({
      vaultId: 'vault-1',
      name: 'New Name',
      currentPassword: 'curr',
      newPassword: 'new'
    })

    expect(getVaultByIdAndClose).toHaveBeenCalledWith('vault-1', {
      password: 'curr'
    })
    expect(updateProtectedVaultApi).toHaveBeenCalledWith({
      vault: {
        id: 'vault-1',
        name: 'New Name',
        version: 2,
        createdAt: 1000,
        updatedAt: 2000,
        extra: 'z'
      },
      currentPassword: 'curr',
      newPassword: 'new'
    })
  })

  test('throws when validation fails and does not call update API', async () => {
    __validateRef.fn = jest.fn(() => ({ error: true }))

    getVaultByIdAndClose.mockResolvedValue({
      id: 'id',
      name: 'n',
      version: 1,
      createdAt: 1,
      updatedAt: 1
    })

    await expect(
      updateProtectedVault({
        vaultId: 'vault-2',
        name: 'Name',
        currentPassword: 'p',
        newPassword: 'np'
      })
    ).rejects.toThrow(/Invalid vault data:/)

    expect(updateProtectedVaultApi).not.toHaveBeenCalled()
  })

  test('propagates API error', async () => {
    getVaultByIdAndClose.mockResolvedValue({
      id: 'id',
      name: 'n',
      version: 1,
      createdAt: 1,
      updatedAt: 1
    })

    updateProtectedVaultApi.mockRejectedValue(new Error('network'))

    await expect(
      updateProtectedVault({
        vaultId: 'vault-3',
        name: 'Name',
        currentPassword: 'p',
        newPassword: 'np'
      })
    ).rejects.toThrow('network')
  })
})
