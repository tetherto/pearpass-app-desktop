import { act, renderHook, waitFor } from '@testing-library/react'

import { usePearUpdate } from './usePearUpdate'
import { UpdateRequiredModalContent } from '../containers/Modal/UpdateRequiredModalContent/UpdateRequiredModalContent'
import { useModal } from '../context/ModalContext'

global.Pear = {
  updates: jest.fn(),
  restart: jest.fn(),
  reload: jest.fn(),
  updated: jest.fn(() => Promise.resolve(false)),
  config: { tier: 'prod', key: 'some-key' }
}

window.electronAPI = {
  checkUpdated: jest.fn(() => Promise.resolve(false)),
  onRuntimeUpdated: jest.fn(() => () => {}),
  restart: jest.fn()
}

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock(
  '../containers/Modal/UpdateRequiredModalContent/UpdateRequiredModalContent',
  () => ({
    UpdateRequiredModalContent: function UpdateRequiredModalContent() {
      return null
    }
  })
)

describe('usePearUpdate', () => {
  let setModalMock

  beforeEach(() => {
    setModalMock = jest.fn()
    useModal.mockReturnValue({ setModal: setModalMock })
    Pear.updates.mockClear()
    Pear.restart.mockClear()
    Pear.reload.mockClear()
    Pear.updated.mockClear()
    Pear.config.tier = 'prod'
    Pear.config.key = 'some-key'
    window.electronAPI.checkUpdated.mockClear()
    window.electronAPI.onRuntimeUpdated.mockClear()
    window.electronAPI.restart.mockClear()
    window.electronAPI.checkUpdated.mockResolvedValue(false)
  })

  it('subscribes to electron runtime updates in prod mode', () => {
    renderHook(() => usePearUpdate())
    expect(window.electronAPI.onRuntimeUpdated).toHaveBeenCalledTimes(1)
  })

  it('shows modal when checkUpdated resolves with isUpdated true', async () => {
    window.electronAPI.checkUpdated.mockResolvedValue(true)

    await act(async () => {
      renderHook(() => usePearUpdate())
    })

    await waitFor(() => {
      expect(setModalMock).toHaveBeenCalledTimes(1)
    })
    expect(Pear.restart).not.toHaveBeenCalled()
    expect(Pear.reload).not.toHaveBeenCalled()
  })

  it('shows modal when onRuntimeUpdated fires (prod)', async () => {
    window.electronAPI.checkUpdated.mockResolvedValue(true)
    let updateCallback
    window.electronAPI.onRuntimeUpdated.mockImplementation((cb) => {
      updateCallback = cb
      return () => {}
    })

    renderHook(() => usePearUpdate())

    await act(async () => {
      updateCallback()
    })

    expect(setModalMock).toHaveBeenCalledTimes(1)
  })

  it('ignores updates in dev mode (no key)', async () => {
    Pear.config.key = null
    renderHook(() => usePearUpdate())

    const callback = Pear.updates.mock.calls[0][0]
    await act(async () => {
      await callback({ diff: [{ key: '/app/file.js' }] })
    })

    expect(setModalMock).not.toHaveBeenCalled()
    expect(Pear.restart).not.toHaveBeenCalled()
    expect(Pear.reload).toHaveBeenCalled()
  })

  it('triggers restart when update handler is called', async () => {
    window.electronAPI.checkUpdated.mockResolvedValue(true)

    await act(async () => {
      renderHook(() => usePearUpdate())
    })

    await waitFor(() => {
      expect(setModalMock).toHaveBeenCalled()
    })
    const modalElement = setModalMock.mock.calls[0][0]
    await act(async () => {
      modalElement.props.onUpdate()
    })
    expect(window.electronAPI.restart).toHaveBeenCalled()
  })

  it('uses UpdateRequiredModalContent for the update modal', async () => {
    window.electronAPI.checkUpdated.mockResolvedValue(true)
    let updateCallback
    window.electronAPI.onRuntimeUpdated.mockImplementation((cb) => {
      updateCallback = cb
      return () => {}
    })
    await act(async () => {
      renderHook(() => usePearUpdate())
    })
    await act(async () => {
      updateCallback()
    })

    expect(setModalMock).toHaveBeenCalledTimes(1)
    const modalElement = setModalMock.mock.calls[0][0]
    expect(modalElement.type).toBe(UpdateRequiredModalContent)
  })
})
