import { pearpassVaultClient } from '../instances'
import { initListener } from './initListener'
import '@testing-library/jest-dom'

describe('initListener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize listener with provided vault ID', async () => {
    const vaultId = 'test-vault-id'
    const onUpdate = jest.fn()

    await initListener({ vaultId, onUpdate })

    expect(pearpassVaultClient.initListener).toHaveBeenCalledWith({ vaultId })
  })

  it('should remove all existing listeners before adding new ones', async () => {
    const vaultId = 'test-vault-id'
    const onUpdate = jest.fn()

    await initListener({ vaultId, onUpdate })

    expect(pearpassVaultClient.removeAllListeners).toHaveBeenCalled()

    const removeAllListenersCallIndex =
      pearpassVaultClient.removeAllListeners.mock.invocationCallOrder[0]
    const onCallIndex = pearpassVaultClient.on.mock.invocationCallOrder[0]
    expect(removeAllListenersCallIndex).toBeLessThan(onCallIndex)
  })

  it('should register the provided onUpdate callback for update events', async () => {
    const vaultId = 'test-vault-id'
    const onUpdate = jest.fn()

    await initListener({ vaultId, onUpdate })

    expect(pearpassVaultClient.on).toHaveBeenCalledWith('update', onUpdate)
  })
})
