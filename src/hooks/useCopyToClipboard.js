import React, { useState, useRef, useEffect } from 'react'

import pearRun from 'pear-run'

import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'
import { logger } from '../utils/logger'

const CLEAR_CLIPBOARD_PATH_DEV = './src/services/clipboardCleanup.js'
const CLEAR_CLIPBOARD_PATH_PROD =
  Pear.config.applink + '/src/services/clipboardCleanup.js'

/**
 * @param {{
 *  onCopy?: () => void
 * }} props
 * @returns {{
 *  isCopied: boolean,
 *  copyToClipboard: (text: string) => boolean
 * }}
 */
export const useCopyToClipboard = ({ onCopy } = {}) => {
  const [isCopyToClipboardDisabled, setIsCopyToClipboardDisabled] =
    useState(false)
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

    if (!navigator.clipboard) {
      logger.error('useCopyToClipboard', 'Clipboard API is not available')
      return false
    }

    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true)

        onCopy?.()

        if (pipeRef.current) {
          pipeRef.current.end()
        }

        pipeRef.current = pearRun(
          Pear.config.key ? CLEAR_CLIPBOARD_PATH_PROD : CLEAR_CLIPBOARD_PATH_DEV
        )
        pipeRef.current.write(text)
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

  return { isCopied, copyToClipboard }
}
