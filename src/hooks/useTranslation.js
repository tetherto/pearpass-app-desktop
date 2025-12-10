import { useCallback } from 'react'

import { useLingui } from '@lingui/react'
/**
 * Custom hook for handling translations using Lingui
 * @returns {Function} t - Translation function that takes a key and returns the translated string
 */

export const useTranslation = () => {
  const { i18n } = useLingui()

  const t = useCallback((key) => i18n._(key), [i18n])

  return {
    t
  }
}
