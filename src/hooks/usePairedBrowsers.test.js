import { act, renderHook, waitFor } from '@testing-library/react'

import { usePairedBrowsers } from './usePairedBrowsers'
import { PAIRED_BROWSERS_CHANGED_EVENT } from '../constants/pairing'
import { createOrGetPearpassClient } from '../services/createOrGetPearpassClient'
import { listClients } from '../services/security/pairedClients'

jest.mock('../services/createOrGetPearpassClient', () => ({
  createOrGetPearpassClient: jest.fn()
}))
jest.mock('../services/security/pairedClients', () => ({
  listClients: jest.fn()
}))
jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn() }
}))

const CHROME = { publicKey: 'chromeKey', label: 'Chrome' }
const FIREFOX = { publicKey: 'firefoxKey', label: 'Firefox' }

describe('usePairedBrowsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createOrGetPearpassClient.mockReturnValue({})
    listClients.mockResolvedValue([CHROME])
  })

  it('loads the paired browsers on mount', async () => {
    const { result } = renderHook(() => usePairedBrowsers())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.browsers).toEqual([CHROME])
  })

  it('reloads when a browser finishes pairing over IPC', async () => {
    const { result } = renderHook(() => usePairedBrowsers())
    await waitFor(() => expect(result.current.browsers).toEqual([CHROME]))

    listClients.mockResolvedValue([CHROME, FIREFOX])
    await act(async () => {
      window.dispatchEvent(new Event(PAIRED_BROWSERS_CHANGED_EVENT))
    })

    await waitFor(() =>
      expect(result.current.browsers).toEqual([CHROME, FIREFOX])
    )
  })

  it('stops listening once unmounted', async () => {
    const { result, unmount } = renderHook(() => usePairedBrowsers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    unmount()
    listClients.mockClear()

    window.dispatchEvent(new Event(PAIRED_BROWSERS_CHANGED_EVENT))

    expect(listClients).not.toHaveBeenCalled()
  })

  it('falls back to an empty list when loading fails', async () => {
    listClients.mockRejectedValue(new Error('vault locked'))

    const { result } = renderHook(() => usePairedBrowsers())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.browsers).toEqual([])
  })
})
