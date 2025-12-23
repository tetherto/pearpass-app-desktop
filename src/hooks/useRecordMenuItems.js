import { RECORD_TYPES } from 'pearpass-lib-vault'

import { useTranslation } from './useTranslation'
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
  const { t } = useTranslation()
  const defaultItems = [
    {
      name: t('Login'),
      type: RECORD_TYPES.LOGIN,
      icon: RECORD_ICON_BY_TYPE.login,
      color: RECORD_COLOR_BY_TYPE.login
    },
    {
      name: t('Identity'),
      type: RECORD_TYPES.IDENTITY,
      icon: RECORD_ICON_BY_TYPE.identity,
      color: RECORD_COLOR_BY_TYPE.identity
    },
    {
      name: t('Credit Card'),
      type: RECORD_TYPES.CREDIT_CARD,
      icon: RECORD_ICON_BY_TYPE.creditCard,
      color: RECORD_COLOR_BY_TYPE.creditCard
    },
    {
      name: t('Wi-Fi'),
      type: RECORD_TYPES.WIFI_PASSWORD,
      icon: RECORD_ICON_BY_TYPE.wifiPassword,
      color: RECORD_COLOR_BY_TYPE.wifiPassword
    },
    {
      name: t('Recovery phrase'),
      type: RECORD_TYPES.PASS_PHRASE,
      icon: RECORD_ICON_BY_TYPE.passPhrase,
      color: RECORD_COLOR_BY_TYPE.passPhrase
    },
    {
      name: t('Note'),
      type: RECORD_TYPES.NOTE,
      icon: RECORD_ICON_BY_TYPE.note,
      color: RECORD_COLOR_BY_TYPE.note
    },

    {
      name: t('Custom'),
      type: RECORD_TYPES.CUSTOM,
      icon: RECORD_ICON_BY_TYPE.custom,
      color: RECORD_COLOR_BY_TYPE.custom
    }
  ]

  const menuItems = [
    {
      name: t('All'),
      type: 'all'
    },
    ...defaultItems
  ]

  const popupItems = [
    ...defaultItems,
    {
      name: t('Password'),
      type: 'password'
    }
  ]

  return { menuItems, popupItems, defaultItems }
}
