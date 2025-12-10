import { useCallback } from 'react'

import { useLingui } from '@lingui/react'

import { useToast } from '../context/ToastContext'
/**
 * @returns {{
 *   pasteFromClipboard: () => Promise<string|null>
 * }}
 */

export const usePasteFromClipboard = () => {
  const { i18n } = useLingui()
  const { setToast } = useToast()

  const pasteFromClipboard = useCallback(async () => {
    try {
      let text = ''
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.readText) {
        text = await navigator.clipboard.readText()
      } else {
        throw new Error('Clipboard API not available')
      }

      if (!text?.length) {
        setToast({
          message: i18n._('No text found in clipboard')
        })
        return null
      }

      setToast({
        message: i18n._('Pasted from clipboard!')
      })

      return text
    } catch {
      setToast({
        message: i18n._('Failed to paste from clipboard')
      })
      return null
    }
  }, [i18n, setToast])

  return { pasteFromClipboard }
}
