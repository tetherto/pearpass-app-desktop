import React, { useMemo } from 'react'

import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import {
  AccountCircleFilled,
  AccountCircleOutlined,
  AssignmentInd,
  CreditCard,
  FormatQuote,
  GridView,
  LayerFilled,
  Layers,
  Note,
  WiFi
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { useTranslation } from './useTranslation'

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

export type RecordMenuItem = {
  type: string
  label: string
  OutlinedIcon: IconComponent
  FilledIcon: IconComponent
}

export const ALL_ITEMS_TYPE = 'all'

export const useRecordMenuItems = () => {
  const { t } = useTranslation()

  const defaultItems: RecordMenuItem[] = useMemo(
    () => [
      {
        type: RECORD_TYPES.LOGIN,
        label: t('Logins'),
        OutlinedIcon: AccountCircleOutlined,
        FilledIcon: AccountCircleFilled
      },
      {
        type: RECORD_TYPES.CREDIT_CARD,
        label: t('Credit Card'),
        OutlinedIcon: CreditCard,
        FilledIcon: CreditCard
      },
      {
        type: RECORD_TYPES.IDENTITY,
        label: t('Identities'),
        OutlinedIcon: AssignmentInd,
        FilledIcon: AssignmentInd
      },
      {
        type: RECORD_TYPES.NOTE,
        label: t('Notes'),
        OutlinedIcon: Note,
        FilledIcon: Note
      },
      {
        type: RECORD_TYPES.PASS_PHRASE,
        label: t('Recovery Phrases'),
        OutlinedIcon: FormatQuote,
        FilledIcon: FormatQuote
      },
      {
        type: RECORD_TYPES.WIFI_PASSWORD,
        label: t('Wi-Fi'),
        OutlinedIcon: WiFi,
        FilledIcon: WiFi
      },
      {
        type: RECORD_TYPES.CUSTOM,
        label: t('Other'),
        OutlinedIcon: GridView,
        FilledIcon: GridView
      }
    ],
    [t]
  )

  const categoriesItems: RecordMenuItem[] = useMemo(
    () => [
      {
        type: ALL_ITEMS_TYPE,
        label: t('All Items'),
        OutlinedIcon: Layers,
        FilledIcon: LayerFilled
      },
      ...defaultItems
    ],
    [t, defaultItems]
  )

  return { categoriesItems, defaultItems }
}
