import { setPearpassVaultClient } from './src/instances'

const mockClient = {
  activeVaultGetStatus: jest.fn(),
  activeVaultClose: jest.fn(),
  vaultsGetStatus: jest.fn(),
  vaultsClose: jest.fn(),
  encryptionGetStatus: jest.fn(),
  encryptionClose: jest.fn(),
  activeVaultCreateInvite: jest.fn(),
  activeVaultDeleteInvite: jest.fn(),
  activeVaultAdd: jest.fn(),
  vaultsAdd: jest.fn(),
  activeVaultInit: jest.fn(),
  activeVaultRemove: jest.fn(),
  encryptionInit: jest.fn(),
  encryptionGet: jest.fn(),
  activeVaultGet: jest.fn(),
  vaultsInit: jest.fn(),
  initListener: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  activeVaultList: jest.fn(),
  vaultsList: jest.fn(),
  pairActiveVault: jest.fn(),
  cancelPairActiveVault: jest.fn(),
  setStoragePath: jest.fn(),
  encryptionAdd: jest.fn()
}

setPearpassVaultClient(mockClient)

global.pearpassVaultClient = mockClient

afterEach(() => {
  jest.clearAllMocks()
})
