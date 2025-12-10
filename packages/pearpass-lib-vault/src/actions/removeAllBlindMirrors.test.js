import { removeAllBlindMirrors } from './removeAllBlindMirrors'

jest.mock('../api/removeAllBlindMirrors', () => ({
  removeAllBlindMirrors: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../api/getBlindMirrors', () => ({
  getBlindMirrors: jest.fn().mockResolvedValue([])
}))

describe('removeAllBlindMirrors action', () => {
  it('dispatches and returns refreshed mirrors', async () => {
    const dispatch = jest.fn()
    const thunk = removeAllBlindMirrors()
    const res = await thunk(dispatch, () => ({}), undefined)

    expect(res.type).toBe('blindMirrors/removeAllBlindMirrors/fulfilled')
    expect(res.payload).toEqual([])
  })
})
