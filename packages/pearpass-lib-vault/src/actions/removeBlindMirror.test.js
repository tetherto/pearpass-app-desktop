import { removeBlindMirror } from './removeBlindMirror'

jest.mock('../api/removeBlindMirror', () => ({
  removeBlindMirror: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../api/getBlindMirrors', () => ({
  getBlindMirrors: jest.fn().mockResolvedValue([{ key: 'k1' }])
}))

describe('removeBlindMirror action', () => {
  it('returns refreshed mirrors after remove', async () => {
    const dispatch = jest.fn()
    const thunk = removeBlindMirror('k2')
    const res = await thunk(dispatch, () => ({}), undefined)

    expect(res.type).toBe('blindMirrors/removeBlindMirror/fulfilled')
    expect(res.payload).toEqual([{ key: 'k1' }])
  })
})
