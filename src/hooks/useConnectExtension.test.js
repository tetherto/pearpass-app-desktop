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

import { act, renderHook, waitFor } from '@testing-library/react'

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
  getFingerprint,
  getOrCreateIdentity,
  getPairingCode
} from '../services/security/appIdentity'
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
  getFingerprint: jest.fn(),
  getOrCreateIdentity: jest.fn(),
  getPairingCode: jest.fn(),
  resetIdentity: jest.fn()
}))
jest.mock('../utils/nativeMessagingSetup', () => ({
  setupNativeMessaging: jest.fn(),
  cleanupNativeMessaging: jest.fn().mockResolvedValue(),
  killNativeMessagingHostProcesses: jest.fn().mockResolvedValue()
}))

describe('useConnectExtension', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('connects extension successfully via toggleBrowserExtension', async () => {
    const fakeIdentity = {
      ed25519PublicKey: 'pubkey',
      creationDate: '2023-01-01'
    }

    setupNativeMessaging.mockResolvedValue({ success: true })
    startNativeMessagingIPC.mockResolvedValue()
    killNativeMessagingHostProcesses.mockResolvedValue()
    createOrGetPearpassClient.mockReturnValue({})
    getOrCreateIdentity.mockResolvedValue(fakeIdentity)
    getPairingCode.mockReturnValue('PAIRCODE')
    getFingerprint.mockReturnValue('ABCD1234')

    const { result } = renderHook(() => useConnectExtension())

    await act(async () => {
      await result.current.toggleBrowserExtension(true)
    })

    expect(setupNativeMessaging).toHaveBeenCalled()
    expect(killNativeMessagingHostProcesses).toHaveBeenCalled()
    expect(startNativeMessagingIPC).toHaveBeenCalled()
    expect(setNativeMessagingEnabled).toHaveBeenCalledWith(true)
    expect(mockSetModal).toHaveBeenCalled()
  })

  it('handles setup failure gracefully via toggleBrowserExtension', async () => {
    setupNativeMessaging.mockResolvedValue({ success: false, message: 'fail' })
    createOrGetPearpassClient.mockReturnValue({})

    const { result } = renderHook(() => useConnectExtension())

    await act(async () => {
      await result.current.toggleBrowserExtension(true)
    })

    expect(setupNativeMessaging).toHaveBeenCalled()
    expect(startNativeMessagingIPC).not.toHaveBeenCalled()
    expect(mockSetToast).toHaveBeenCalled()
  })

  it('stops native messaging when toggled off', async () => {
    stopNativeMessagingIPC.mockResolvedValue()

    const { result } = renderHook(() => useConnectExtension())

    await act(async () => {
      await result.current.toggleBrowserExtension(false)
    })

    expect(stopNativeMessagingIPC).toHaveBeenCalled()
    expect(setNativeMessagingEnabled).toHaveBeenCalledWith(false)
  })

  it('loads pairing info on enable', async () => {
    const fakeIdentity = {
      ed25519PublicKey: 'pubkey',
      creationDate: '2023-01-01'
    }

    setupNativeMessaging.mockResolvedValue({ success: true })
    startNativeMessagingIPC.mockResolvedValue()
    killNativeMessagingHostProcesses.mockResolvedValue()
    getOrCreateIdentity.mockResolvedValue(fakeIdentity)
    getPairingCode.mockReturnValue('PAIRCODE')
    getFingerprint.mockReturnValue('ABCD1234')

    getNativeMessagingEnabled.mockReturnValue(false)
    isNativeMessagingIPCRunning.mockReturnValue(false)
    createOrGetPearpassClient.mockReturnValue({})

    const { result } = renderHook(() => useConnectExtension())

    await act(async () => {
      await result.current.toggleBrowserExtension(true)
    })

    await waitFor(() => {
      expect(getOrCreateIdentity).toHaveBeenCalled()
      expect(getPairingCode).toHaveBeenCalledWith('pubkey')
      expect(getFingerprint).toHaveBeenCalledWith('pubkey')
    })
  })
})
