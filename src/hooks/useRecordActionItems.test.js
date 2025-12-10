import { renderHook } from '@testing-library/react'

import { useRecordActionItems } from './useRecordActionItems'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'

const mockDeleteRecord = jest.fn()
const mockUpdateFavoriteState = jest.fn()

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../context/RouterContext', () => ({
  useRouter: jest.fn()
}))

jest.mock('pearpass-lib-vault', () => ({
  useRecords: () => ({
    deleteRecords: mockDeleteRecord,
    updateFavoriteState: mockUpdateFavoriteState
  })
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (text) => text
    }
  })
}))

describe('useRecordActionItems', () => {
  const mockRecord = { id: '123', isFavorite: false }
  const mockOnSelect = jest.fn()
  const mockOnClose = jest.fn()

  const mockSetModal = jest.fn()
  const mockCloseModal = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useModal.mockReturnValue({
      setModal: mockSetModal,
      closeModal: mockCloseModal
    })

    useRouter.mockReturnValue({
      data: {},
      navigate: mockNavigate,
      currentPage: 'somePage'
    })
  })

  test('returns correct actions when no excludeTypes provided', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    expect(result.current.actions).toHaveLength(4)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('favorite')
    expect(result.current.actions[2].type).toBe('move')
    expect(result.current.actions[3].type).toBe('delete')
  })

  test('filters actions based on excludeTypes', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        excludeTypes: ['delete', 'move'],
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    expect(result.current.actions).toHaveLength(2)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('favorite')
  })

  test('handles select action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[0].click()
    expect(mockOnSelect).toHaveBeenCalledWith(mockRecord)
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles favorite toggle action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[1].click()
    expect(mockUpdateFavoriteState).toHaveBeenCalledWith([mockRecord.id], true)
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles move action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[2].click()
    expect(mockSetModal).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles delete action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[3].click()
    expect(mockSetModal).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles delete confirmation', () => {
    useRouter.mockReturnValue({
      data: { recordId: '123' },
      navigate: mockNavigate,
      currentPage: 'somePage'
    })

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[3].click()

    const confirmationAction =
      mockSetModal.mock.calls[0][0].props.secondaryAction

    confirmationAction()

    expect(mockNavigate).toHaveBeenCalledWith('somePage', {
      recordId: undefined
    })
    expect(mockDeleteRecord).toHaveBeenCalledWith(['123'])
    expect(mockCloseModal).toHaveBeenCalled()
  })
})
