import { selectInvite } from './selectInvite'

describe('selectInvite', () => {
  it('should return invite state', () => {
    const mockState = {
      invite: {
        id: '123',
        email: 'test@example.com'
      }
    }

    expect(selectInvite(mockState)).toEqual(mockState.invite)
  })

  it('should return undefined when state is null', () => {
    expect(selectInvite(null)).toBeUndefined()
  })

  it('should return undefined when invite is not present in state', () => {
    const mockState = {
      user: { id: '123' }
    }

    expect(selectInvite(mockState)).toBeUndefined()
  })
})
