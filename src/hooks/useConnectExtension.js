import { useState } from 'react'

import { html } from 'htm/react'

import { CopyIcon } from '../lib-react-components'
import { useCopyToClipboard } from './useCopyToClipboard'
import { useTranslation } from './useTranslation'
import { COPY_FEEDBACK_DISPLAY_TIME } from '../constants/timeConstants'
import { ExtensionPairingModalContent } from '../containers/Modal/ExtensionPairingModalContent'
import { useGlobalLoading } from '../context/LoadingContext.js'
import { useModal } from '../context/ModalContext'
import { useToast } from '../context/ToastContext'
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
  getPairingCode,
  resetIdentity
} from '../services/security/appIdentity'
import { clearAllSessions } from '../services/security/sessionStore.js'
import {
  setupNativeMessaging,
  killNativeMessagingHostProcesses,
  cleanupNativeMessaging
} from '../utils/nativeMessagingSetup'

export const useConnectExtension = () => {
  const { setModal } = useModal()
  const { setToast } = useToast()
  const { t } = useTranslation()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => setToast({ message: t('Copied!'), icon: CopyIcon })
  })

  const [isBrowserExtensionEnabled, setIsBrowserExtensionEnabled] = useState(
    getNativeMessagingEnabled() && isNativeMessagingIPCRunning()
  )

  const handleSetupExtension = async () => {
    // Setup native messaging for the extension
    const result = await setupNativeMessaging()

    if (result.success) {
      // Kill any existing native host so Chrome respawns it and re-reads the manifest
      await killNativeMessagingHostProcesses()
      // Start native messaging IPC server
      const client = createOrGetPearpassClient()
      await startNativeMessagingIPC(client)
      setNativeMessagingEnabled(true)
      setIsBrowserExtensionEnabled(true)
      setToast({
        message: t('PearPass ready for extension connection.')
      })
    } else {
      const errorMessage = result.message || t('Setup failed')
      throw new Error(errorMessage)
    }
  }

  const handleStopNativeMessaging = async () => {
    clearAllSessions()
    await stopNativeMessagingIPC()

    // Ensure any running native host is terminated so it cannot continue talking
    await killNativeMessagingHostProcesses()

    // Clean unused manifest file and make sure browser cannot respawn the host while off
    await cleanupNativeMessaging().catch(() => {})

    resetState()

    setNativeMessagingEnabled(false)

    // Reset identity to force re-pairing
    // This prevents extensions from reconnecting without a new pairing token
    const client = createOrGetPearpassClient()
    await resetIdentity(client)
  }

  // Pairing info state
  const [isExtensionConnectionLoading, setIsExtensionConnectionLoading] =
    useState(false)
  useGlobalLoading({ isLoading: isExtensionConnectionLoading })
  const [copyFeedback, setCopyFeedback] = useState('')

  const resetState = () => {
    setIsBrowserExtensionEnabled(false)
    setIsExtensionConnectionLoading(false)
    setCopyFeedback('')
  }

  const loadPairingInfo = async (reset = false) => {
    const client = createOrGetPearpassClient()

    const id = reset
      ? // Reset pairing - generate new identity and clear sessions
        await resetIdentity(client)
      : // Just load existing identity
        await getOrCreateIdentity(client)

    const code = getPairingCode(id.ed25519PublicKey)
    const fingerprint = getFingerprint(id.ed25519PublicKey)
    // Create a combined token for secure pairing
    const token = `${code}-${fingerprint.slice(0, 4).toUpperCase()}`
    const result = {
      pairingToken: token,
      fingerprint,
      tokenCreationDate: id.creationDate
    }

    if (reset) {
      // Show feedback when new token is generated
      setCopyFeedback(t('New pairing token generated!'))
      setTimeout(() => setCopyFeedback(''), COPY_FEEDBACK_DISPLAY_TIME)
    }

    return result
  }

  const toggleBrowserExtension = async (isOn) => {
    if (isOn) {
      setIsExtensionConnectionLoading(true)
      return handleSetupExtension()
        .then(loadPairingInfo)
        .then(({ pairingToken, fingerprint, tokenCreationDate }) => {
          setModal(
            html`<${ExtensionPairingModalContent}
              onCopy=${() => copyToClipboard(pairingToken)}
              pairingToken=${pairingToken}
              loadingPairing=${isExtensionConnectionLoading}
              copyFeedback=${copyFeedback}
              tokenCreationDate=${tokenCreationDate}
              fingerprint=${fingerprint}
            />`,
            { replace: true }
          )
        })
        .catch((error) => {
          setToast({ message: t('Error: ') + error.message })
        })
        .finally(() => {
          setIsExtensionConnectionLoading(false)
        })
    }

    return handleStopNativeMessaging()
  }

  return {
    toggleBrowserExtension,
    isBrowserExtensionEnabled
  }
}
