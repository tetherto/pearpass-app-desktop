import { deleteInvite } from './deleteInvite'
import { deleteInvite as deleteInviteApi } from '../api/deleteInvite.js'

jest.mock('../api/deleteInvite', () => ({
  deleteInvite: jest.fn()
}))

describe('deleteInvite', () => {
  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    dispatch = jest.fn()
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {}
      }
    })
  })

  it('should delete an invite and return a payload of null', async () => {
    const thunk = deleteInvite()
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(null)
  })

  it('should call deleteInviteApi', async () => {
    const thunk = deleteInvite()
    await thunk(dispatch, getState)

    expect(deleteInviteApi).toHaveBeenCalled()
  })
})
