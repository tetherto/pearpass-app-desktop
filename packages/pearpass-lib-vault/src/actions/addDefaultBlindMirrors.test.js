import { addDefaultBlindMirrors } from './addDefaultBlindMirrors'

jest.mock('../api/addDefaultBlindMirrors', () => ({
  addDefaultBlindMirrors: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../api/getBlindMirrors', () => ({
  getBlindMirrors: jest.fn().mockResolvedValue([{ key: 'k1' }, { key: 'k2' }])
}))

describe('addDefaultBlindMirrors action', () => {
  it('returns refreshed mirrors after add', async () => {
    const dispatch = jest.fn()
    const thunk = addDefaultBlindMirrors()
    const res = await thunk(dispatch, () => ({}), undefined)

    expect(res.type).toBe('blindMirrors/addDefaultBlindMirrors/fulfilled')
    expect(res.payload).toEqual([{ key: 'k1' }, { key: 'k2' }])
  })
})
