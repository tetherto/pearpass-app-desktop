import { renderHook } from '@testing-library/react'

import { useRecordActionItems } from './useRecordActionItems'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'
import { isV2 } from '../utils/designVersion'

const mockDeleteRecord = jest.fn()
const mockUpdateFavoriteState = jest.fn()
const mockHandleCreateOrEditRecord = jest.fn()

jest.mock(
  '../containers/Modal/MoveFolderModalContentV2/MoveFolderModalContentV2',
  () => ({
    MoveFolderModalContentV2: () => null
  })
)

jest.mock('../containers/Modal/DeleteRecordsModalContentV2', () => ({
  DeleteRecordsModalContentV2: () => null
}))

jest.mock('../utils/designVersion', () => ({
  isV2: jest.fn().mockReturnValue(true)
}))

jest.mock(
  '../containers/Modal/CreateFolderModalContentV2/CreateFolderModalContentV2',
  () => ({
    CreateFolderModalContentV2: function MockCreateFolderModalContentV2() {
      return null
    }
  })
)

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ setToast: jest.fn() })
}))

jest.mock('../context/RouterContext', () => ({
  useRouter: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  RECORD_TYPES: { LOGIN: 'login', OTP: 'otp' },
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

jest.mock('./useCreateOrEditRecord', () => ({
  useCreateOrEditRecord: () => ({
    handleCreateOrEditRecord: mockHandleCreateOrEditRecord
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
    isV2.mockReturnValue(true)

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

    expect(result.current.actions).toHaveLength(5)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('edit')
    expect(result.current.actions[2].type).toBe('favorite')
    expect(result.current.actions[3].type).toBe('move')
    expect(result.current.actions[4].type).toBe('delete')
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

    expect(result.current.actions).toHaveLength(3)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('edit')
    expect(result.current.actions[2].type).toBe('favorite')
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

    const favoriteAction = result.current.actions.find(
      (action) => action.type === 'favorite'
    )
    favoriteAction.click()
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

    const moveAction = result.current.actions.find(
      (action) => action.type === 'move'
    )
    moveAction.click()
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

    const deleteAction = result.current.actions.find(
      (action) => action.type === 'delete'
    )
    deleteAction.click()
    expect(mockSetModal).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles delete confirmation', () => {
    isV2.mockReturnValue(false)

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

    const deleteAction = result.current.actions.find(
      (action) => action.type === 'delete'
    )
    deleteAction.click()

    const confirmationAction =
      mockSetModal.mock.calls[0][0].props.secondaryAction

    confirmationAction()

    expect(mockNavigate).toHaveBeenCalledWith('somePage', {
      recordId: undefined
    })
    expect(mockDeleteRecord).toHaveBeenCalledWith(['123'])
    expect(mockCloseModal).toHaveBeenCalled()
  })

  test('handles edit action — uses record type when no recordType prop given', () => {
    const loginRecord = { id: '123', type: 'login', isFavorite: false }

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: loginRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    const editAction = result.current.actions.find(
      (action) => action.type === 'edit'
    )
    editAction.click()

    expect(mockHandleCreateOrEditRecord).toHaveBeenCalledWith({
      recordType: 'login',
      initialRecord: loginRecord
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles edit action — uses OTP type when recordType is otp', () => {
    const otpLoginRecord = { id: '123', type: 'login', isFavorite: false }

    useRouter.mockReturnValue({
      data: { recordType: 'otp' },
      navigate: mockNavigate,
      currentPage: 'somePage'
    })

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: otpLoginRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    const editAction = result.current.actions.find(
      (action) => action.type === 'edit'
    )
    editAction.click()

    expect(mockHandleCreateOrEditRecord).toHaveBeenCalledWith({
      recordType: 'otp',
      initialRecord: otpLoginRecord
    })
    expect(mockOnClose).toHaveBeenCalled()
  })
})
