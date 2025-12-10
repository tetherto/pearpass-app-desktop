import { jest } from '@jest/globals'
import { useLingui } from '@lingui/react'
import { renderHook, act } from '@testing-library/react'

jest.mock('@lingui/react', () => ({
  useLingui: jest.fn()
}))

import { useTranslation } from '../useTranslation'

describe('useTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns an object with a t function', () => {
    const translateMock = jest.fn((key) => `translated:${key}`)
    useLingui.mockReturnValue({ i18n: { _: translateMock } })

    const { result } = renderHook(() => useTranslation())

    expect(result.current).toHaveProperty('t')
    expect(typeof result.current.t).toBe('function')
  })

  test('t calls i18n._ with the provided key and returns translation', () => {
    const translateMock = jest.fn((key) => `translated:${key}`)
    useLingui.mockReturnValue({ i18n: { _: translateMock } })

    const { result } = renderHook(() => useTranslation())

    let output
    act(() => {
      output = result.current.t('hello.world')
    })

    expect(translateMock).toHaveBeenCalledTimes(1)
    expect(translateMock).toHaveBeenCalledWith('hello.world')
    expect(output).toBe('translated:hello.world')
  })

  test('t reference is stable when i18n instance does not change', () => {
    const translateMock = jest.fn((key) => key)
    const i18nInstance = { _: translateMock }
    useLingui.mockReturnValue({ i18n: i18nInstance })

    const { result, rerender } = renderHook(() => useTranslation())
    const firstT = result.current.t

    rerender()
    const secondT = result.current.t

    expect(secondT).toBe(firstT)
  })

  test('t reference updates when i18n instance changes', () => {
    const translateMock1 = jest.fn((key) => key)
    const translateMock2 = jest.fn((key) => key)

    const i18n1 = { _: translateMock1 }
    const i18n2 = { _: translateMock2 }

    useLingui
      .mockReturnValueOnce({ i18n: i18n1 })
      .mockReturnValue({ i18n: i18n2 })

    const { result, rerender } = renderHook(() => useTranslation())
    const firstT = result.current.t

    rerender()
    const secondT = result.current.t

    expect(secondT).not.toBe(firstT)
  })
})
