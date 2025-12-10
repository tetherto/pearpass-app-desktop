import { useLingui } from '@lingui/react'
import { renderHook } from '@testing-library/react'
import { RECORD_TYPES } from 'pearpass-lib-vault'

import { useRecordMenuItems } from './useRecordMenuItems'
import { RECORD_COLOR_BY_TYPE } from '../constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../constants/recordIconByType'

jest.mock('@lingui/react', () => ({
  useLingui: jest.fn()
}))

jest.mock('pearpass-lib-vault', () => ({
  RECORD_TYPES: {
    LOGIN: 'login',
    IDENTITY: 'identity',
    CREDIT_CARD: 'credit_card',
    NOTE: 'note',
    CUSTOM: 'custom'
  }
}))

describe('useRecordMenuItems', () => {
  const mockI18n = {
    _: jest.fn((str) => str)
  }

  beforeEach(() => {
    useLingui.mockReturnValue({ i18n: mockI18n })
  })

  it('should return menu items with correct structure', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current).toHaveProperty('menuItems')
    expect(result.current).toHaveProperty('popupItems')
    expect(result.current).toHaveProperty('defaultItems')
  })

  it('should have "All" as first menuItem', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current.menuItems[0]).toEqual({
      name: 'All',
      type: 'all'
    })
  })

  it('should have default items in menuItems after "All"', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current.menuItems[1].type).toBe(RECORD_TYPES.LOGIN)
    expect(result.current.menuItems[2].type).toBe(RECORD_TYPES.IDENTITY)
    expect(result.current.menuItems[3].type).toBe(RECORD_TYPES.CREDIT_CARD)
    expect(result.current.menuItems[4].type).toBe(RECORD_TYPES.WIFI_PASSWORD)
    expect(result.current.menuItems[5].type).toBe(RECORD_TYPES.PASS_PHRASE)
    expect(result.current.menuItems[6].type).toBe(RECORD_TYPES.NOTE)
    expect(result.current.menuItems[7].type).toBe(RECORD_TYPES.CUSTOM)
  })

  it('should include icons and colors in default items', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    const loginItem = result.current.defaultItems.find(
      (item) => item.type === RECORD_TYPES.LOGIN
    )
    expect(loginItem.icon).toBe(RECORD_ICON_BY_TYPE.login)
    expect(loginItem.color).toBe(RECORD_COLOR_BY_TYPE.login)
  })

  it('should include "Password" in popupItems but not in defaultItems', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    const passwordInPopup = result.current.popupItems.find(
      (item) => item.type === 'password'
    )
    const passwordInDefault = result.current.defaultItems.find(
      (item) => item.type === 'password'
    )

    expect(passwordInPopup).toBeTruthy()
    expect(passwordInPopup.name).toBe('Password')
    expect(passwordInDefault).toBeFalsy()
  })

  it('should call i18n._ for all item names', () => {
    renderHook(() => useRecordMenuItems())

    expect(mockI18n._).toHaveBeenCalledWith('Login')
    expect(mockI18n._).toHaveBeenCalledWith('Identity')
    expect(mockI18n._).toHaveBeenCalledWith('Credit Card')
    expect(mockI18n._).toHaveBeenCalledWith('Wi-Fi')
    expect(mockI18n._).toHaveBeenCalledWith('PassPhrase')
    expect(mockI18n._).toHaveBeenCalledWith('Note')
    expect(mockI18n._).toHaveBeenCalledWith('Custom')
    expect(mockI18n._).toHaveBeenCalledWith('All')
    expect(mockI18n._).toHaveBeenCalledWith('Password')
  })
})
