import React, { useState } from 'react'

import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useCopyToClipboard } from './useCopyToClipboard.electron'
import { useTranslation } from './useTranslation'
import { PAIRED_BROWSERS_CHANGED_EVENT } from '../constants/pairing'
import { AddBrowserModalContent } from '../containers/Modal/AddBrowserModalContent/AddBrowserModalContent'
import { ExtensionPairingModalContent } from '../containers/Modal/ExtensionPairingModalContent/ExtensionPairingModalContent'
import { useGlobalLoading } from '../context/LoadingContext.js'
import { useModal } from '../context/ModalContext'
import { useToast } from '../context/ToastContext'
import { getElectronConfig } from '../electron'
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
import {
  clearAllSessions,
  closeSessionsForClient
} from '../services/security/sessionStore.js'
import {
  setupNativeMessaging,
  killNativeMessagingHostProcesses,
  cleanupNativeMessaging
} from '../utils/nativeMessagingSetup'

const notifyPairedBrowsersChanged = () => {
  window.dispatchEvent(new Event(PAIRED_BROWSERS_CHANGED_EVENT))
}

export const useConnectExtension = () => {
  const { setModal } = useModal()
  const { setToast } = useToast()
  const { t } = useTranslation()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => setToast({ message: t('Copied!'), icon: ContentCopy })
  })

  const [isBrowserExtensionEnabled, setIsBrowserExtensionEnabled] = useState(
    getNativeMessagingEnabled() && isNativeMessagingIPCRunning()
  )

  const [isExtensionConnectionLoading, setIsExtensionConnectionLoading] =
    useState(false)
  useGlobalLoading({ isLoading: isExtensionConnectionLoading })

  const handleSetupExtension = async () => {
    // Setup native messaging for the extension
    const config = await getElectronConfig()
    const result = await setupNativeMessaging({
      userDataPath: config.userDataPath,
      execPath: config.execPath,
      bridgePath: config.bridgePath
    })

    if (!result.success) {
      throw new Error(result.message || t('Setup failed'))
    }

    // Kill any existing native host so Chrome respawns it and re-reads the manifest
    await killNativeMessagingHostProcesses()
    // Start native messaging IPC server
    const client = createOrGetPearpassClient()
    await startNativeMessagingIPC(client)
    setNativeMessagingEnabled(true)
    setIsBrowserExtensionEnabled(true)
  }

  /**
   * Mint a single-use invitation and show its code.
   * @param {string} label - User-chosen name for the browser being paired
   */
  const createInvite = async (label) => {
    const client = createOrGetPearpassClient()

    const id = await getOrCreateIdentity(client)

    // Mark pairing as approved for this identity so that nmBeginHandshake is allowed
    await client
      .encryptionAdd('nm.identity.pairingApproved', 'true')
      .catch(() => {})

    const trimmedLabel = label?.trim()
    const resolvedLabel =
      trimmedLabel ||
      t('Browser {count}', { count: (await listClients(client)).length + 1 })

    const invite = await mintInvite(client, resolvedLabel)
    const pairingToken = getInviteCode(id.ed25519PublicKey, invite)

    setModal(
      <ExtensionPairingModalContent
        onCopy={() => copyToClipboard(pairingToken)}
        pairingToken={pairingToken}
        loadingPairing={false}
        label={resolvedLabel}
        expiresAt={invite.expiresAt}
      />,
      { replace: true }
    )
  }

  /**
   * Start pairing a browser. Enables the integration first if it is off, so
   * this is the only entry point the settings screen needs.
   */
  const addBrowser = async () => {
    setIsExtensionConnectionLoading(true)
    try {
      if (!isBrowserExtensionEnabled) {
        await handleSetupExtension()
      }

      setModal(<AddBrowserModalContent onSubmit={createInvite} />)
    } catch (error) {
      setToast({ message: t('Error: ') + error.message })
    } finally {
      setIsExtensionConnectionLoading(false)
    }
  }

  /**
   * Revoke a single browser, leaving every other paired browser connected.
   * @param {string} publicKey
   */
  const unpairBrowser = async (publicKey) => {
    try {
      const client = createOrGetPearpassClient()
      await removeClient(client, publicKey)
      closeSessionsForClient(publicKey)
      notifyPairedBrowsersChanged()
      setToast({ message: t('Browser unpaired.') })
    } catch (error) {
      setToast({ message: t('Error: ') + error.message })
    }
  }

  /**
   * Turn the integration off entirely: every browser is unpaired, the host
   * identity is reset and browsers can no longer respawn the native host.
   */
  const disableBrowserExtension = async () => {
    const client = createOrGetPearpassClient()

    clearAllSessions()
    await stopNativeMessagingIPC()

    // Ensure any running native host is terminated so it cannot continue talking
    await killNativeMessagingHostProcesses()

    // Clean unused manifest file and make sure browser cannot respawn the host while off
    await cleanupNativeMessaging().catch(() => {})

    await clearClients(client).catch(() => {})
    await clearInvites(client).catch(() => {})

    setIsBrowserExtensionEnabled(false)
    setIsExtensionConnectionLoading(false)

    setNativeMessagingEnabled(false)

    // Reset identity to force re-pairing
    // This prevents extensions from reconnecting without a new pairing token
    await resetIdentity(client)

    notifyPairedBrowsersChanged()
  }

  return {
    addBrowser,
    unpairBrowser,
    disableBrowserExtension,
    isBrowserExtensionEnabled
  }
}
