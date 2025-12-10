import React from 'react'

import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import { usePasteFromClipboard } from './usePasteFromClipboard'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s) => s } })
}))

const mockSetToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ setToast: mockSetToast })
}))

let exposedPaste
const HookHost = () => {
  const { pasteFromClipboard } = usePasteFromClipboard()
  exposedPaste = pasteFromClipboard
  return null
}

describe('usePasteFromClipboard', () => {
  const originalNavigator = global.navigator

  const renderHost = () => {
    render(<HookHost />)
  }

  afterEach(() => {
    mockSetToast.mockReset()
    // Restore navigator between tests
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true
    })
  })

  test('returns text and shows success toast when clipboard has text', async () => {
    const readText = jest.fn().mockResolvedValue('hello world')
    Object.defineProperty(global, 'navigator', {
      value: { clipboard: { readText } },
      configurable: true
    })

    renderHost()
    let result
    await act(async () => {
      result = await exposedPaste()
    })

    expect(readText).toHaveBeenCalled()
    expect(result).toBe('hello world')
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Pasted from clipboard!'
    })
  })

  test('returns null and warns when clipboard text is empty', async () => {
    const readText = jest.fn().mockResolvedValue('')
    Object.defineProperty(global, 'navigator', {
      value: { clipboard: { readText } },
      configurable: true
    })

    renderHost()
    let result
    await act(async () => {
      result = await exposedPaste()
    })

    expect(readText).toHaveBeenCalled()
    expect(result).toBeNull()
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'No text found in clipboard'
    })
  })

  test('returns null and shows failure toast when API unavailable or throws', async () => {
    // Case: navigator missing clipboard API
    Object.defineProperty(global, 'navigator', {
      value: {},
      configurable: true
    })

    renderHost()
    let result
    await act(async () => {
      result = await exposedPaste()
    })

    expect(result).toBeNull()
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Failed to paste from clipboard'
    })

    mockSetToast.mockReset()

    // Case: readText throws
    const readText = jest.fn().mockRejectedValue(new Error('boom'))
    Object.defineProperty(global, 'navigator', {
      value: { clipboard: { readText } },
      configurable: true
    })

    await act(async () => {
      result = await exposedPaste()
    })

    expect(readText).toHaveBeenCalled()
    expect(result).toBeNull()
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Failed to paste from clipboard'
    })
  })
})
