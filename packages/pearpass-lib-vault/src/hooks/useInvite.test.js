import { useDispatch, useSelector } from 'react-redux'

import { useInvite } from './useInvite.js'
import { createInvite as createInviteAction } from '../actions/createInvite'
import { deleteInvite as deleteInviteAction } from '../actions/deleteInvite'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/createInvite', () => ({
  createInvite: jest.fn()
}))

jest.mock('../actions/deleteInvite', () => ({
  deleteInvite: jest.fn()
}))

describe('useInvite', () => {
  let mockDispatch

  beforeEach(() => {
    mockDispatch = jest.fn()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockReturnValue({
      isLoading: false,
      data: { inviteId: 'test-invite-id' }
    })
    createInviteAction.mockReturnValue({ type: 'CREATE_INVITE' })
    deleteInviteAction.mockReturnValue({ type: 'DELETE_INVITE' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return the correct data structure', () => {
    const { isLoading, createInvite, deleteInvite, data } = useInvite()

    expect(isLoading).toBe(false)
    expect(typeof createInvite).toBe('function')
    expect(typeof deleteInvite).toBe('function')
    expect(data).toEqual({ inviteId: 'test-invite-id' })
  })

  test.each([
    [
      'createInvite',
      createInviteAction,
      'CREATE_INVITE',
      { inviteId: 'new-invite-id' }
    ],
    ['deleteInvite', deleteInviteAction, 'DELETE_INVITE', null]
  ])(
    'should dispatch %s action',
    async (method, actionMock, actionType, payload) => {
      mockDispatch.mockResolvedValue({
        error: false,
        payload
      })

      const hook = useInvite()
      await hook[method]()

      expect(actionMock).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith({ type: actionType })
    }
  )

  test.each([
    ['createInvite', { inviteId: 'success-invite-id' }],
    ['deleteInvite', null]
  ])(
    'createInvite and deleteInvite should return correct action payload',
    async (method, payload) => {
      mockDispatch.mockResolvedValue({ error: false, payload })

      const hook = useInvite()

      const dispatchResult = await hook[method]()

      expect(dispatchResult.payload).toEqual(payload)
    }
  )

  test.each([['createInvite'], ['deleteInvite']])(
    'createInvite and deleteInvite should return error when dispatch fails',
    async (method) => {
      mockDispatch.mockResolvedValue({ error: true })

      const hook = useInvite()

      const dispatchResult = await hook[method]()

      expect(dispatchResult.error).toEqual(true)
    }
  )
})
