import React, { useState, useRef, useEffect } from 'react'

import pearRun from 'pear-run'

import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'
import { logger } from '../utils/logger'

const CLEAR_CLIPBOARD_PATH_DEV = './subProcess/clipboardCleanup.js'
const CLEAR_CLIPBOARD_PATH_PROD =
  Pear.config.applink + '/subProcess/clipboardCleanup.js'

/**
 * @param {{
 *  onCopy?: () => void
 * }} props
 * @returns {{
 *  isCopied: boolean,
 *  copyToClipboard: (text: string) => boolean
 *  isCopyToClipboardDisabled: boolean
 * }}
 */
export const useCopyToClipboard = ({ onCopy } = {}) => {
  const [isCopyToClipboardDisabled, setIsCopyToClipboardDisabled] =
    useState(true) // disabled by default to ensure visual stability
  const [isCopied, setIsCopied] = useState(false)

  const pipeRef = useRef(null)

  useEffect(() => {
    const checkCopyToClipboardDisabled = () => {
      const isDisabled = localStorage.getItem(
        LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED
      )

      setIsCopyToClipboardDisabled(isDisabled === 'true')
    }

    checkCopyToClipboardDisabled()
  }, [])

  const copyToClipboard = (text) => {
    if (isCopyToClipboardDisabled) {
      return false
    }

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

        // Clean up any existing worker
        if (pipeRef.current) {
          try {
            pipeRef.current.destroy()
          } catch {
            // Ignore cleanup errors
          }
        }

        // Spawn worker with text as command-line argument
        // This avoids the pipe closing issue that caused premature worker exit
        const workerPath = Pear.config.key
          ? CLEAR_CLIPBOARD_PATH_PROD
          : CLEAR_CLIPBOARD_PATH_DEV

        pipeRef.current = pearRun(workerPath)

        pipeRef.current.on('error', (err) => {
          logger.error('useCopyToClipboard', 'Worker error', err)
        })

        pipeRef.current.on('crash', (info) => {
          logger.error('useCopyToClipboard', 'Worker crashed', info)
        })
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
