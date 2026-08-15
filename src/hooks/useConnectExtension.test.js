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
jest.mock(
  '../containers/Modal/ExtensionPairingModalContent/ExtensionPairingModalContent',
  () => ({ ExtensionPairingModalContent: () => null })
)
jest.mock(
  '../containers/Modal/AddBrowserModalContent/AddBrowserModalContent',
  () => ({ AddBrowserModalContent: () => null })
)

import { act, renderHook } from '@testing-library/react'

import { useConnectExtension } from './useConnectExtension'
import { createOrGetPearpassClient } from '../services/createOrGetPearpassClient'
import {
  isNativeMessagingIPCRunning,
  startNativeMessagingIPC,
  stopNativeMessagingIPC
} from '../services/nativeMessagingIPCServer'
import {
  getNativeMessagingEnabled,
  setNativeMessagingEnabled
} from '../services/nativeMessagingPreferences'
import {
  getOrCreateIdentity,
  resetIdentity
} from '../services/security/appIdentity'
import {
  clearClients,
  listClients,
  removeClient
} from '../services/security/pairedClients'
import {
  clearInvites,
  getInviteCode,
  mintInvite
} from '../services/security/pairingInvites'
import { closeSessionsForClient } from '../services/security/sessionStore'
import {
  killNativeMessagingHostProcesses,
  setupNativeMessaging
} from '../utils/nativeMessagingSetup'

const mockSetModal = jest.fn()
const mockSetToast = jest.fn()

jest.mock('../context/ModalContext', () => ({
  useModal: () => ({ setModal: mockSetModal })
}))
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ setToast: mockSetToast })
}))
jest.mock('../context/LoadingContext', () => ({
  useGlobalLoading: jest.fn()
}))
jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (msg) => msg } })
}))

jest.mock('../services/createOrGetPearpassClient', () => ({
  createOrGetPearpassClient: jest.fn()
}))
jest.mock('../services/nativeMessagingIPCServer', () => ({
  isNativeMessagingIPCRunning: jest.fn(),
  startNativeMessagingIPC: jest.fn(),
  stopNativeMessagingIPC: jest.fn()
}))
jest.mock('../services/nativeMessagingPreferences', () => ({
  getNativeMessagingEnabled: jest.fn(),
  setNativeMessagingEnabled: jest.fn()
}))
jest.mock('../services/security/appIdentity', () => ({
  getOrCreateIdentity: jest.fn(),
  resetIdentity: jest.fn()
}))
jest.mock('../services/security/pairedClients', () => ({
  clearClients: jest.fn().mockResolvedValue(undefined),
  listClients: jest.fn(),
  removeClient: jest.fn().mockResolvedValue(true)
}))
jest.mock('../services/security/pairingInvites', () => ({
  clearInvites: jest.fn().mockResolvedValue(undefined),
  getInviteCode: jest.fn(),
  mintInvite: jest.fn()
}))
jest.mock('../services/security/sessionStore.js', () => ({
  clearAllSessions: jest.fn(),
  closeSessionsForClient: jest.fn()
}))
jest.mock('../utils/nativeMessagingSetup', () => ({
  setupNativeMessaging: jest.fn(),
  cleanupNativeMessaging: jest.fn().mockResolvedValue(),
  killNativeMessagingHostProcesses: jest.fn().mockResolvedValue()
}))
jest.mock('../electron', () => ({
  getElectronConfig: jest.fn().mockResolvedValue({
    userDataPath: '/mock/user/data',
    execPath: '/mock/exec/path',
    bridgePath: '/mock/bridge/path'
  })
}))

describe('useConnectExtension', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createOrGetPearpassClient.mockReturnValue({
      encryptionAdd: jest.fn().mockResolvedValue(undefined)
    })
    listClients.mockResolvedValue([])
  })

  it('initializes extension state if enabled and running', () => {
    getNativeMessagingEnabled.mockReturnValue(true)
    isNativeMessagingIPCRunning.mockReturnValue(true)

    const { result } = renderHook(() => useConnectExtension())
    expect(result.current.isBrowserExtensionEnabled).toBe(true)
  })

  it('does not enable if not running or not enabled', () => {
    getNativeMessagingEnabled.mockReturnValue(false)
    isNativeMessagingIPCRunning.mockReturnValue(false)

    const { result } = renderHook(() => useConnectExtension())
    expect(result.current.isBrowserExtensionEnabled).toBe(false)
  })

  describe('addBrowser', () => {
    beforeEach(() => {
      getNativeMessagingEnabled.mockReturnValue(false)
      isNativeMessagingIPCRunning.mockReturnValue(false)
      setupNativeMessaging.mockResolvedValue({ success: true })
      startNativeMessagingIPC.mockResolvedValue()
    })

    it('sets up native messaging then opens the naming modal', async () => {
      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.addBrowser()
      })

      expect(setupNativeMessaging).toHaveBeenCalled()
      expect(killNativeMessagingHostProcesses).toHaveBeenCalled()
      expect(startNativeMessagingIPC).toHaveBeenCalled()
      expect(setNativeMessagingEnabled).toHaveBeenCalledWith(true)
      expect(mockSetModal).toHaveBeenCalled()
    })

    it('skips setup when the integration is already on', async () => {
      getNativeMessagingEnabled.mockReturnValue(true)
      isNativeMessagingIPCRunning.mockReturnValue(true)

      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.addBrowser()
      })

      expect(setupNativeMessaging).not.toHaveBeenCalled()
      expect(mockSetModal).toHaveBeenCalled()
    })

    it('reports setup failure without opening the modal', async () => {
      setupNativeMessaging.mockResolvedValue({
        success: false,
        message: 'fail'
      })

      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.addBrowser()
      })

      expect(startNativeMessagingIPC).not.toHaveBeenCalled()
      expect(mockSetModal).not.toHaveBeenCalled()
      expect(mockSetToast).toHaveBeenCalled()
    })

    it('mints an invite and shows its code when a label is submitted', async () => {
      const invite = { id: 'invite-1', expiresAt: '2026-08-12T10:00:00.000Z' }
      getOrCreateIdentity.mockResolvedValue({ ed25519PublicKey: 'pubkey' })
      mintInvite.mockResolvedValue(invite)
      getInviteCode.mockReturnValue('123456-ABCD')

      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.addBrowser()
      })

      // The naming modal hands the chosen label back to the hook
      const onSubmit = mockSetModal.mock.calls[0][0].props.onSubmit
      await act(async () => {
        await onSubmit('Chrome — work laptop')
      })

      expect(mintInvite).toHaveBeenCalledWith(
        expect.anything(),
        'Chrome — work laptop'
      )
      expect(getInviteCode).toHaveBeenCalledWith('pubkey', invite)
      expect(mockSetModal).toHaveBeenLastCalledWith(expect.anything(), {
        replace: true
      })
    })

    it('falls back to a numbered label when none is given', async () => {
      listClients.mockResolvedValue([{ publicKey: 'a' }, { publicKey: 'b' }])
      getOrCreateIdentity.mockResolvedValue({ ed25519PublicKey: 'pubkey' })
      mintInvite.mockResolvedValue({ id: 'invite-1', expiresAt: 'later' })
      getInviteCode.mockReturnValue('123456-ABCD')

      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.addBrowser()
      })

      const onSubmit = mockSetModal.mock.calls[0][0].props.onSubmit
      await act(async () => {
        await onSubmit('   ')
      })

      expect(mintInvite).toHaveBeenCalledWith(
        expect.anything(),
        'Browser {count}'
      )
    })
  })

  describe('unpairBrowser', () => {
    it('removes only that client and closes its sessions', async () => {
      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.unpairBrowser('chromeKey')
      })

      expect(removeClient).toHaveBeenCalledWith(expect.anything(), 'chromeKey')
      expect(closeSessionsForClient).toHaveBeenCalledWith('chromeKey')
      // The integration itself stays up for the remaining browsers
      expect(stopNativeMessagingIPC).not.toHaveBeenCalled()
      expect(resetIdentity).not.toHaveBeenCalled()
    })

    it('announces the change so the settings list refreshes', async () => {
      const listener = jest.fn()
      window.addEventListener('paired-browsers-changed', listener)

      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.unpairBrowser('chromeKey')
      })

      expect(listener).toHaveBeenCalled()
      window.removeEventListener('paired-browsers-changed', listener)
    })
  })

  describe('disableBrowserExtension', () => {
    it('tears down the integration and clears every pairing', async () => {
      stopNativeMessagingIPC.mockResolvedValue()

      const { result } = renderHook(() => useConnectExtension())

      await act(async () => {
        await result.current.disableBrowserExtension()
      })

      expect(stopNativeMessagingIPC).toHaveBeenCalled()
      expect(killNativeMessagingHostProcesses).toHaveBeenCalled()
      expect(clearClients).toHaveBeenCalled()
      expect(clearInvites).toHaveBeenCalled()
      expect(setNativeMessagingEnabled).toHaveBeenCalledWith(false)
      expect(resetIdentity).toHaveBeenCalled()
      expect(result.current.isBrowserExtensionEnabled).toBe(false)
    })
  })
})
