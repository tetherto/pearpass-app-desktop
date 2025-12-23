
import { useCallback } from 'react'
import { useLingui } from '@lingui/react'

/**
 * Custom hook for handling translations using Lingui
 * @returns {Object} Object containing the translation function
 * @returns {Function} t - Translation function that takes a key and returns the translated string
 */
export const useTranslation = () => {
  const { i18n } = useLingui()

  const t = useCallback((key: string): string => {
    return i18n._(key)
  }, [i18n])

  return {
    t
  }
}
