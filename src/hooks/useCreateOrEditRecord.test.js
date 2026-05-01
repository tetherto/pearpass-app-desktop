import { renderHook } from '@testing-library/react'

import { useCreateOrEditRecord } from './useCreateOrEditRecord'
import { useModal } from '../context/ModalContext'
import '@testing-library/jest-dom'

jest.mock(
  '../containers/Modal/CreateFolderModalContentV2/CreateFolderModalContentV2',
  () => ({
    CreateFolderModalContentV2: function MockCreateFolderModalContentV2() {
      return null
    }
  })
)

jest.mock(
  '../containers/Modal/DisplayPictureModalContentV2/DisplayPictureModalContentV2',
  () => ({
    DisplayPictureModalContentV2: function MockDisplayPictureModalContentV2() {
      return null
    }
  })
)

jest.mock('../containers/Modal/CreateOrEditCategoryWrapper', () => ({
  CreateOrEditCategoryWrapper: function MockCreateOrEditCategoryWrapper() {
    return null
  }
}))

jest.mock(
  '../containers/Modal/GeneratePasswordModalContentV2/GeneratePasswordModalContentV2',
  () => ({
    GeneratePasswordModalContentV2:
      function MockGeneratePasswordModalContentV2() {
        return null
      }
  })
)

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('@tetherto/pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn(() => 'mocked-unique-id')
}))

jest.mock('../utils/designVersion', () => ({
  isV2: () => true
}))

describe('useCreateOrEditRecord', () => {
  const setModalMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useModal.mockReturnValue({ setModal: setModalMock })
  })

  it('should return handleCreateOrEditRecord function', () => {
    const { result } = renderHook(() => useCreateOrEditRecord())
    expect(typeof result.current.handleCreateOrEditRecord).toBe('function')
  })

  it('should call setModal for password record type', () => {
    const { result } = renderHook(() => useCreateOrEditRecord())
    const setValue = jest.fn()

    result.current.handleCreateOrEditRecord({
      recordType: 'password',
      setValue
    })

    expect(setModalMock).toHaveBeenCalledTimes(1)
    expect(setModalMock.mock.calls[0][1]).toBeUndefined()
  })

  it('should call setModal with category wrapper content for non-password record types', () => {
    const { result } = renderHook(() => useCreateOrEditRecord())

    result.current.handleCreateOrEditRecord({
      recordType: 'login',
      initialRecord: { id: '123' },
      selectedFolder: 'folder1'
    })

    expect(setModalMock).toHaveBeenCalledTimes(1)
    expect(setModalMock.mock.calls[0][1]).toBeUndefined()
  })

  it('should handle various record types', () => {
    const { result } = renderHook(() => useCreateOrEditRecord())
    const recordTypes = ['login', 'creditCard', 'identity', 'note', 'custom']

    recordTypes.forEach((recordType) => {
      setModalMock.mockClear()
      result.current.handleCreateOrEditRecord({ recordType })
      expect(setModalMock).toHaveBeenCalledTimes(1)
    })
  })
})
