/**
 * Electron renderer implementation: uses Clipboard API only.
 * No pear-run / pear-ipc so the bundle doesn't pull in Node-only deps (__filename, etc.).
 * Optional: clear clipboard after delay can be added via IPC to main later.
 */
import React, { useState, useEffect } from 'react'

import { CLIPBOARD_CLEAR_TIMEOUT } from '@tetherto/pearpass-lib-constants'

import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'
import { logger } from '../utils/logger'

/**
 * @param {{ onCopy?: () => void }} props
 * @returns {{ isCopied: boolean, copyToClipboard: (text: string) => boolean, isCopyToClipboardDisabled: boolean }}
 */
export const useCopyToClipboard = ({ onCopy } = {}) => {
  const [isCopyToClipboardDisabled, setIsCopyToClipboardDisabled] =
    useState(true)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const disabled = localStorage.getItem(
      LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED
    )
    setIsCopyToClipboardDisabled(disabled === 'true')
  }, [])

  const copyToClipboard = (text) => {
    if (isCopyToClipboardDisabled) return false
    if (!text || typeof text !== 'string') {
      logger.error('useCopyToClipboard', 'Text to copy is invalid or undefined')
      return false
    }
    if (!navigator.clipboard) {
      logger.error('useCopyToClipboard', 'Clipboard API is not available')
      return false
    }
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true)
        onCopy?.()
        // Clear clipboard automatically after delay
        if (window.electronAPI) {
          window.electronAPI.clearClipboardAfter?.(
            text,
            CLIPBOARD_CLEAR_TIMEOUT
          )
        }
      },
      (err) => {
        logger.error(
          'useCopyToClipboard',
          'Failed to copy text to clipboard',
          err
        )
      }
    )
    return true
  }

  return { isCopied, copyToClipboard, isCopyToClipboardDisabled }
}
