import { useLingui } from '@lingui/react'
import { RECORD_TYPES } from 'pearpass-lib-vault'

import { RECORD_COLOR_BY_TYPE } from '../constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../constants/recordIconByType'

/**
 * @returns {{
 * categoriesItems: Array<{
 *  name: string,
 *  type: string
 *  }>,
 * defaultItems: Array<{
 *  name: string,
 *  type: string
 *  }>,
 * popupItems: Array<{
 *  name: string,
 *  type: string
 * }>}}
 */
export const useRecordMenuItems = () => {
  const { i18n } = useLingui()

  const defaultItems = [
    {
      name: i18n._('Login'),
      type: RECORD_TYPES.LOGIN,
      icon: RECORD_ICON_BY_TYPE.login,
      color: RECORD_COLOR_BY_TYPE.login
    },
    {
      name: i18n._('Identity'),
      type: RECORD_TYPES.IDENTITY,
      icon: RECORD_ICON_BY_TYPE.identity,
      color: RECORD_COLOR_BY_TYPE.identity
    },
    {
      name: i18n._('Credit Card'),
      type: RECORD_TYPES.CREDIT_CARD,
      icon: RECORD_ICON_BY_TYPE.creditCard,
      color: RECORD_COLOR_BY_TYPE.creditCard
    },
    {
      name: i18n._('Wi-Fi'),
      type: RECORD_TYPES.WIFI_PASSWORD,
      icon: RECORD_ICON_BY_TYPE.wifiPassword,
      color: RECORD_COLOR_BY_TYPE.wifiPassword
    },
    {
      name: i18n._('PassPhrase'),
      type: RECORD_TYPES.PASS_PHRASE,
      icon: RECORD_ICON_BY_TYPE.passPhrase,
      color: RECORD_COLOR_BY_TYPE.passPhrase
    },
    {
      name: i18n._('Note'),
      type: RECORD_TYPES.NOTE,
      icon: RECORD_ICON_BY_TYPE.note,
      color: RECORD_COLOR_BY_TYPE.note
    },

    {
      name: i18n._('Custom'),
      type: RECORD_TYPES.CUSTOM,
      icon: RECORD_ICON_BY_TYPE.custom,
      color: RECORD_COLOR_BY_TYPE.custom
    }
  ]

  const menuItems = [
    {
      name: i18n._('All'),
      type: 'all'
    },
    ...defaultItems
  ]

  const popupItems = [
    ...defaultItems,
    {
      name: i18n._('Password'),
      type: 'password'
    }
  ]

  return { menuItems, popupItems, defaultItems }
}
