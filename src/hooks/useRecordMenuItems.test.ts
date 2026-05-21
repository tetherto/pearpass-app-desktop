import { renderHook } from '@testing-library/react'

import { ALL_ITEMS_TYPE, useRecordMenuItems } from './useRecordMenuItems'

jest.mock('./useTranslation', () => ({
  useTranslation: () => ({ t: (s: string) => s })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  RECORD_TYPES: {
    LOGIN: 'login',
    IDENTITY: 'identity',
    CREDIT_CARD: 'credit_card',
    NOTE: 'note',
    CUSTOM: 'custom',
    WIFI_PASSWORD: 'wifi_password',
    PASS_PHRASE: 'pass_phrase'
  }
}))

const iconStub = () => null

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  AccountCircleFilled: iconStub,
  AccountCircleOutlined: iconStub,
  AssignmentInd: iconStub,
  CreditCard: iconStub,
  FormatQuote: iconStub,
  GridView: iconStub,
  LayerFilled: iconStub,
  Layers: iconStub,
  Note: iconStub,
  WiFi: iconStub
}))

describe('useRecordMenuItems', () => {
  it('returns categoriesItems and defaultItems', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current).toHaveProperty('categoriesItems')
    expect(result.current).toHaveProperty('defaultItems')
  })

  it('prepends ALL_ITEMS_TYPE ("All Items") to categoriesItems', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current.categoriesItems[0]).toMatchObject({
      type: ALL_ITEMS_TYPE,
      label: 'All Items'
    })
  })

  it('orders defaultItems to match the Figma sidebar order', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current.defaultItems.map((i) => i.type)).toEqual([
      'login',
      'credit_card',
      'identity',
      'note',
      'pass_phrase',
      'wifi_password',
      'custom'
    ])
  })

  it('uses pluralized labels', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    const labels = Object.fromEntries(
      result.current.defaultItems.map((i) => [i.type, i.label])
    )

    expect(labels).toMatchObject({
      login: 'Logins',
      credit_card: 'Credit Card',
      identity: 'Identities',
      note: 'Notes',
      pass_phrase: 'Recovery Phrases',
      wifi_password: 'Wi-Fi',
      custom: 'Other'
    })
  })

  it('provides both OutlinedIcon and FilledIcon per item', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    for (const item of result.current.categoriesItems) {
      expect(typeof item.OutlinedIcon).toBe('function')
      expect(typeof item.FilledIcon).toBe('function')
    }
  })
})
