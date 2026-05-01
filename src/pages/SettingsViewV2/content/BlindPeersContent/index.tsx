import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  BLIND_PEER_TYPE,
  BLIND_PEERS_LEARN_MORE,
  BLIND_PEERS_LIMIT
} from '@tetherto/pearpass-lib-constants'
import {
  Button,
  InputField,
  MultiSlotInput,
  PageHeader,
  Radio,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Add, Close } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useBlindMirrors } from '@tetherto/pearpass-lib-vault'
import { useLoadingContext } from '../../../../context/LoadingContext'
import { useToast } from '../../../../context/ToastContext'
import { useUnsavedChanges } from '../../../../context/UnsavedChangesContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

const TEST_IDS = {
  settingsCardBlindPeering: 'settings-card-blind-peering',
  ruleSelectorBlindPeers: 'ruleselector-switchwithlabel-blindPeers'
} as const

const keysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

/** Stable string when mirror list *content* changes (hook may return a new [] ref each render). */
function getMirrorsSnapshotKey(
  data: ReadonlyArray<{ isDefault: boolean; key: string }>
): string {
  if (data.length === 0) {
    return ''
  }
  return data.map((m) => `${m.isDefault ? '1' : '0'}:${m.key}`).join('\u001f')
}

export const BlindPeersContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { colors } = theme
  const styles = createStyles(colors)
  const { setIsLoading, isLoading } = useLoadingContext()
  const { setToast } = useToast()

  const {
    removeAllBlindMirrors,
    data: blindMirrorsData,
    getBlindMirrors,
    addBlindMirrors,
    addDefaultBlindMirrors
  } = useBlindMirrors()

  /** User enabled blind peering but has not saved yet */
  const [isDraft, setIsDraft] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [peerType, setPeerType] = useState<
    typeof BLIND_PEER_TYPE.DEFAULT | typeof BLIND_PEER_TYPE.PERSONAL
  >(BLIND_PEER_TYPE.DEFAULT)
  const [peerKeys, setPeerKeys] = useState<string[]>([''])

  const mirrorsSnapshotKey = getMirrorsSnapshotKey(blindMirrorsData)

  useEffect(() => {
    getBlindMirrors()
  }, [])

  useEffect(() => {
    if (isDraft || isSaving) {
      return
    }
    if (blindMirrorsData.length === 0) {
      return
    }
    const data = blindMirrorsData
    setPeerType(
      data[0].isDefault ? BLIND_PEER_TYPE.DEFAULT : BLIND_PEER_TYPE.PERSONAL
    )
    if (!data[0].isDefault) {
      setPeerKeys(
        data
          .map((m: { key: string }) => m.key)
          .filter(Boolean)
          .slice(0, BLIND_PEERS_LIMIT)
      )
    } else {
      setPeerKeys([''])
    }
  }, [isDraft, isSaving, mirrorsSnapshotKey])

  const handleBlindMirrorsRequest = useCallback(
    async ({
      callback,
      errorMessage,
      successMessage
    }: {
      callback: () => Promise<void>
      errorMessage: string
      successMessage?: string
    }): Promise<boolean> => {
      try {
        setIsLoading(true)
        await callback()
        if (successMessage) {
          setToast({ message: successMessage })
        }
        return true
      } catch {
        setToast({ message: errorMessage })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [setIsLoading, setToast]
  )

  const applyPeerConfig = useCallback(
    async (data: {
      isEditMode?: boolean
      blindPeerType: string
      blindPeers?: string[]
    }): Promise<boolean> => {
      if (data.blindPeerType === BLIND_PEER_TYPE.PERSONAL) {
        if (!data.blindPeers?.length) {
          return false
        }
        if (data.isEditMode) {
          const removed = await handleBlindMirrorsRequest({
            callback: removeAllBlindMirrors,
            errorMessage: t('Error removing existing Blind Peers')
          })
          if (!removed) return false
        }
        return await handleBlindMirrorsRequest({
          callback: () => addBlindMirrors(data.blindPeers!),
          errorMessage: t('Error adding Blind Peers'),
          successMessage: t('Manual Blind Peers enabled successfully')
        })
      }

      if (data.blindPeerType === BLIND_PEER_TYPE.DEFAULT) {
        if (
          data.isEditMode &&
          blindMirrorsData.length > 0 &&
          !blindMirrorsData[0].isDefault
        ) {
          const removed = await handleBlindMirrorsRequest({
            callback: removeAllBlindMirrors,
            errorMessage: t('Error removing existing Blind Peers')
          })
          if (!removed) return false
        }
        return await handleBlindMirrorsRequest({
          callback: addDefaultBlindMirrors,
          errorMessage: t('Error adding Blind Peers'),
          successMessage: t('Automatic Blind Peers enabled successfully')
        })
      }

      return false
    },
    [
      addBlindMirrors,
      addDefaultBlindMirrors,
      blindMirrorsData,
      handleBlindMirrorsRequest,
      removeAllBlindMirrors,
      t
    ]
  )

  const onToggleChange = useCallback(
    (checked: boolean) => {
      if (!checked) {
        void handleBlindMirrorsRequest({
          callback: removeAllBlindMirrors,
          errorMessage: t('Error removing Blind Peers')
        })
        setIsDraft(false)
        setPeerType(BLIND_PEER_TYPE.DEFAULT)
        setPeerKeys([''])
        return
      }
      setIsDraft(true)
      setPeerType(BLIND_PEER_TYPE.DEFAULT)
      setPeerKeys([''])
    },
    [handleBlindMirrorsRequest, removeAllBlindMirrors, t]
  )

  const handlePeerTypeChange = useCallback(
    (value: string) => {
      if (value === BLIND_PEER_TYPE.DEFAULT) {
        setPeerType(BLIND_PEER_TYPE.DEFAULT)
        return
      }
      setPeerType(BLIND_PEER_TYPE.PERSONAL)
      if (blindMirrorsData.length === 0 || blindMirrorsData[0].isDefault) {
        setPeerKeys([''])
      }
    },
    [blindMirrorsData]
  )

  const updatePeerKey = useCallback((index: number, value: string) => {
    setPeerKeys((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const addPeerRow = useCallback(() => {
    setPeerKeys((prev) =>
      prev.length >= BLIND_PEERS_LIMIT ? prev : [...prev, '']
    )
  }, [])

  const removePeerRow = useCallback((index: number) => {
    setPeerKeys((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const trimmedPeerKeys = useMemo(
    () => peerKeys.map((k) => k.trim()).filter(Boolean),
    [peerKeys]
  )

  const { savedPeerType, savedKeys } = useMemo(() => {
    if (!blindMirrorsData.length) {
      return {
        savedPeerType: null as
          | typeof BLIND_PEER_TYPE.DEFAULT
          | typeof BLIND_PEER_TYPE.PERSONAL
          | null,
        savedKeys: [] as string[]
      }
    }
    const first = blindMirrorsData[0]
    return {
      savedPeerType: first.isDefault
        ? BLIND_PEER_TYPE.DEFAULT
        : BLIND_PEER_TYPE.PERSONAL,
      savedKeys: first.isDefault
        ? []
        : blindMirrorsData.map((m: { key: string }) => m.key).filter(Boolean)
    }
  }, [blindMirrorsData])

  const hasMirrors = blindMirrorsData.length > 0
  const interactionDisabled = isLoading

  const isDirty = useMemo(() => {
    if (!hasMirrors || savedPeerType == null) {
      return false
    }
    if (peerType !== savedPeerType) {
      return true
    }
    if (
      peerType === BLIND_PEER_TYPE.PERSONAL &&
      savedPeerType === BLIND_PEER_TYPE.PERSONAL
    ) {
      return !keysEqual(trimmedPeerKeys, savedKeys)
    }
    return false
  }, [hasMirrors, peerType, savedPeerType, savedKeys, trimmedPeerKeys])

  const saveDisabled = useMemo(() => {
    if (isSaving) {
      return true
    }
    if (peerType === BLIND_PEER_TYPE.DEFAULT) {
      return false
    }
    if (trimmedPeerKeys.length === 0) {
      return true
    }
    if (isDraft) {
      return false
    }
    if (!hasMirrors) {
      return false
    }
    return !isDirty
  }, [hasMirrors, isDirty, isDraft, isSaving, peerType, trimmedPeerKeys.length])

  const handleConfirm = useCallback(async (): Promise<boolean> => {
    if (peerType === BLIND_PEER_TYPE.PERSONAL && trimmedPeerKeys.length === 0) {
      setToast({ message: t('Add at least one blind peer code') })
      return false
    }
    if (
      peerType === BLIND_PEER_TYPE.PERSONAL &&
      trimmedPeerKeys.length > BLIND_PEERS_LIMIT
    ) {
      setToast({
        message: t('You can add at most {count} blind peers', {
          count: BLIND_PEERS_LIMIT
        })
      })
      return false
    }
    setIsSaving(true)
    let succeeded = false
    try {
      const isEditMode = blindMirrorsData.length > 0
      succeeded = await applyPeerConfig({
        blindPeerType: peerType,
        blindPeers:
          peerType === BLIND_PEER_TYPE.PERSONAL
            ? trimmedPeerKeys.slice(0, BLIND_PEERS_LIMIT)
            : undefined,
        isEditMode
      })
      await Promise.resolve(getBlindMirrors())
    } finally {
      setIsSaving(false)
      if (succeeded) {
        setIsDraft(false)
      }
    }
    return succeeded
  }, [
    applyPeerConfig,
    blindMirrorsData.length,
    getBlindMirrors,
    peerType,
    setToast,
    t,
    trimmedPeerKeys
  ])

  const toggleChecked = hasMirrors || isDraft || isSaving

  const hasUnsavedChanges = useMemo(
    () => (isDraft || isDirty) && !saveDisabled,
    [isDirty, isDraft, saveDisabled]
  )

  const { setGuard } = useUnsavedChanges()
  const handleConfirmRef = useRef(handleConfirm)
  useEffect(() => {
    handleConfirmRef.current = handleConfirm
  }, [handleConfirm])

  useEffect(() => {
    setGuard({
      hasUnsavedChanges,
      description: t(
        'You have unsaved changes to your Blind Peering settings. Would you like to save them before leaving?'
      ),
      save: () => handleConfirmRef.current()
    })
    return () => {
      setGuard(null)
    }
  }, [hasUnsavedChanges, setGuard, t])

  const automaticRadioOptions = useMemo(
    () => [
      {
        value: BLIND_PEER_TYPE.DEFAULT,
        label: t('Automatic Blind Peers'),
        description: t(
          'Let PearPass allocate blind peers for you to handle syncing'
        )
      }
    ],
    [t]
  )

  const manualRadioOptions = useMemo(
    () => [
      {
        value: BLIND_PEER_TYPE.PERSONAL,
        label: t('Manual Blind Peers'),
        description: t('Setup your own private blind peers')
      }
    ],
    [t]
  )
  return (
    <div data-testid={TEST_IDS.settingsCardBlindPeering} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('Blind Peering')}
        subtitle={
          <>
            {t(
              'Sync your encrypted vault with other devices to improve availability and reliability. Peers only see encrypted data - they can’t access or read anything.'
            )}
            <br />
            <a
              href={BLIND_PEERS_LEARN_MORE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.colorPrimary,
                textDecoration: 'underline'
              }}
            >
              {t('Learn more about Blind Peering.')}
            </a>
          </>
        }
      />

      <div style={styles.settingCard}>
        <div style={styles.toggleBlock}>
          <ToggleSwitch
            data-testid={TEST_IDS.ruleSelectorBlindPeers}
            checked={toggleChecked}
            disabled={interactionDisabled}
            onChange={onToggleChange}
            label={t('Enable Blind Peering')}
            description={t('Allows your vault to sync through blind peers')}
            aria-label={t('Enable Blind Peering')}
          />
        </div>

        {toggleChecked && (
          <>
            <div style={styles.radioBlock}>
              <div style={styles.modeRadioGroup}>
                <div style={styles.radioOptionPad}>
                  <Radio
                    builtIn
                    testID="settings-blind-peering-mode"
                    value={peerType}
                    onChange={handlePeerTypeChange}
                    disabled={interactionDisabled}
                    options={automaticRadioOptions}
                  />
                </div>
                <div style={styles.manualOptionBlock}>
                  <div style={styles.radioOptionPad}>
                    <Radio
                      builtIn
                      testID="settings-blind-peering-mode-manual"
                      value={peerType}
                      onChange={handlePeerTypeChange}
                      disabled={interactionDisabled}
                      options={manualRadioOptions}
                    />
                  </div>
                  {peerType === BLIND_PEER_TYPE.PERSONAL && (
                    <div style={styles.manualMultislotWrap}>
                      <MultiSlotInput
                        testID="blind-peers-manual-multislot"
                        actions={
                          <div style={styles.multiSlotActions}>
                            <Button
                              variant="tertiaryAccent"
                              size="medium"
                              disabled={
                                interactionDisabled ||
                                peerKeys.length >= BLIND_PEERS_LIMIT
                              }
                              onClick={addPeerRow}
                              iconBefore={<Add width={14} height={14} />}
                            >
                              {t('Add Another Peer')}
                            </Button>
                          </div>
                        }
                      >
                        {peerKeys.map((peerCode, index) => (
                          <InputField
                            key={`blind-peer-row-${index}`}
                            label={`#${index + 1} ${t('Blind Peer')}`}
                            placeholder={t('Enter Peer Code')}
                            value={peerCode}
                            onChange={(e) =>
                              updatePeerKey(index, e.target.value)
                            }
                            disabled={interactionDisabled}
                            testID={`blind-peer-input-${index}`}
                            rightSlot={
                              peerKeys.length > 1 ? (
                                <Button
                                  variant="tertiary"
                                  size="small"
                                  type="button"
                                  aria-label={t('Remove peer')}
                                  disabled={interactionDisabled}
                                  onClick={() => removePeerRow(index)}
                                  iconBefore={
                                    <Close
                                      width={24}
                                      height={24}
                                      color={colors.colorTextPrimary}
                                    />
                                  }
                                />
                              ) : null
                            }
                          />
                        ))}
                      </MultiSlotInput>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {toggleChecked && (
        <div style={styles.saveChangesRow}>
          <Button
            variant="primary"
            size="small"
            disabled={saveDisabled}
            onClick={() => void handleConfirm()}
            data-testid="blind-peers-save-changes"
          >
            {t('Save Changes')}
          </Button>
        </div>
      )}
    </div>
  )
}
