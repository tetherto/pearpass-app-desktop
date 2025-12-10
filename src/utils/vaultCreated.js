import { useLingui } from '@lingui/react'
import { formatDate } from 'pear-apps-utils-date'

/**
 * @param {string|Date} vaultCreatedDate
 * @returns { string }
 */
export function vaultCreatedFormat(vaultCreatedDate) {
  const { i18n } = useLingui()

  if (vaultCreatedDate) {
    return (
      i18n._('Created') + ' ' + formatDate(vaultCreatedDate, 'dd-mm-yyyy', '/')
    )
  }

  return ''
}
