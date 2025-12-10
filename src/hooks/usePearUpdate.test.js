import { renderHook, act } from '@testing-library/react'

import { usePearUpdate } from './usePearUpdate'
import { useModal } from '../context/ModalContext'

global.Pear = {
  updates: jest.fn(),
  restart: jest.fn(),
  reload: jest.fn(),
  updated: jest.fn(() => Promise.resolve(false)),
  config: { tier: 'prod', key: 'some-key' }
}

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

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
  })

  it('subscribes to Pear updates', () => {
    renderHook(() => usePearUpdate())
    expect(Pear.updates).toHaveBeenCalledTimes(1)
  })

  it('shows modal when update has non-ignored changes (prod)', async () => {
    renderHook(() => usePearUpdate())

    const callback = Pear.updates.mock.calls[0][0]
    await act(async () => {
      await callback({ diff: [{ key: '/src/file.js' }] })
    })

    expect(setModalMock).toHaveBeenCalledTimes(1)
    expect(Pear.restart).not.toHaveBeenCalled()
    expect(Pear.reload).not.toHaveBeenCalled()
  })

  it('does not show modal for only ignored files', async () => {
    renderHook(() => usePearUpdate())

    const callback = Pear.updates.mock.calls[0][0]
    await act(async () => {
      await callback({ diff: [{ key: '/logs/log.txt' }] })
    })

    expect(setModalMock).not.toHaveBeenCalled()
  })

  it('reloads app immediately in dev mode (no key)', async () => {
    Pear.config.key = null
    renderHook(() => usePearUpdate())

    const callback = Pear.updates.mock.calls[0][0]
    await act(async () => {
      await callback({ diff: [{ key: '/src/file.js' }] })
    })

    expect(Pear.reload).toHaveBeenCalledTimes(1)
  })

  it('triggers restart when update handler is called', async () => {
    renderHook(() => usePearUpdate())

    const callback = Pear.updates.mock.calls[0][0]
    await act(async () => {
      await callback({ diff: [{ key: '/src/file.js' }] })
    })

    const modalVNode = setModalMock.mock.calls[0][0]
    modalVNode.props.onUpdate()
    expect(Pear.restart).toHaveBeenCalledWith({ platform: false })
  })
})
