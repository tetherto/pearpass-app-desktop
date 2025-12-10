import { addBlindMirrors } from './addBlindMirrors'

jest.mock('../api/addBlindMirrors', () => ({
  addBlindMirrors: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../api/getBlindMirrors', () => ({
  getBlindMirrors: jest.fn().mockResolvedValue([{ key: 'k1' }, { key: 'k2' }])
}))

describe('addBlindMirrors action', () => {
  it('returns refreshed mirrors after add', async () => {
    const dispatch = jest.fn()
    const thunk = addBlindMirrors(['k1', 'k2'])
    const res = await thunk(dispatch, () => ({}), undefined)

    expect(res.type).toBe('blindMirrors/addBlindMirrors/fulfilled')
    expect(res.payload).toEqual([{ key: 'k1' }, { key: 'k2' }])
  })
})
