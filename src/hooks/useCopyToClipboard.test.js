import { EventEmitter } from 'events'

import { renderHook, act, waitFor } from '@testing-library/react'

import { useCopyToClipboard } from './useCopyToClipboard'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'
import { logger } from '../utils/logger'

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

// Mock Pear global
global.Pear = {
  config: {
    key: undefined,
    applink: ''
  }
}

// Mock pear-run module
const mockPipe = Object.assign(new EventEmitter(), {
  write: jest.fn(),
  end: jest.fn(),
  destroy: jest.fn()
})
jest.mock('pear-run', () => jest.fn(() => mockPipe))

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
})

jest.useFakeTimers()

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('initial state is not copied', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.isCopied).toBe(false)
  })

  test('does not copy when copy to clipboard is disabled', async () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED, 'true')

    const { result } = renderHook(() => useCopyToClipboard())

    let returnValue
    await act(async () => {
      returnValue = result.current.copyToClipboard('test text')
    })

    expect(returnValue).toBe(false)
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  test('copies when copy to clipboard is not disabled', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      result.current.copyToClipboard('test text')
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
  })

  test('isCopied becomes true after successful copy', async () => {
    navigator.clipboard.writeText.mockResolvedValueOnce()

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      result.current.copyToClipboard('test text')
    })

    await waitFor(() => {
      expect(result.current.isCopied).toBe(true)
    })
  })

  test('onCopy callback is called when copying is successful', async () => {
    const onCopy = jest.fn()
    navigator.clipboard.writeText.mockResolvedValueOnce()

    const { result } = renderHook(() => useCopyToClipboard({ onCopy }))

    await act(async () => {
      result.current.copyToClipboard('test text')
    })

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledTimes(1)
    })
  })

  test('returns false when clipboard API is not available', async () => {
    const originalClipboard = navigator.clipboard
    delete navigator.clipboard

    const { result } = renderHook(() => useCopyToClipboard())

    let returnValue
    await act(async () => {
      returnValue = result.current.copyToClipboard('test text')
    })

    expect(returnValue).toBe(false)

    navigator.clipboard = originalClipboard
  })

  test('returns false and logs error when text is undefined', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    let returnValue
    await act(async () => {
      returnValue = result.current.copyToClipboard(undefined)
    })

    expect(returnValue).toBe(false)
    expect(logger.error).toHaveBeenCalledWith(
      'useCopyToClipboard',
      'Text to copy is invalid or undefined'
    )
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  test('returns false and logs error when text is null', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    let returnValue
    await act(async () => {
      returnValue = result.current.copyToClipboard(null)
    })

    expect(returnValue).toBe(false)
    expect(logger.error).toHaveBeenCalledWith(
      'useCopyToClipboard',
      'Text to copy is invalid or undefined'
    )
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  test('returns false and logs error when text is not a string', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    let returnValue
    await act(async () => {
      returnValue = result.current.copyToClipboard(123)
    })

    expect(returnValue).toBe(false)
    expect(logger.error).toHaveBeenCalledWith(
      'useCopyToClipboard',
      'Text to copy is invalid or undefined'
    )
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })
})
