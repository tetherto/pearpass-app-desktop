import {
  selectBlindMirrors,
  selectBlindMirrorsData,
  selectBlindMirrorsError,
  selectBlindMirrorsLoading
} from './selectBlindMirrors'

describe('selectBlindMirrors', () => {
  const state = {
    blindMirrors: {
      isLoading: true,
      error: 'err',
      data: [{ key: 'a' }]
    }
  }

  it('returns slice', () => {
    expect(selectBlindMirrors(state)).toBe(state.blindMirrors)
  })

  it('returns data', () => {
    expect(selectBlindMirrorsData(state)).toEqual([{ key: 'a' }])
  })

  it('returns loading', () => {
    expect(selectBlindMirrorsLoading(state)).toBe(true)
  })

  it('returns error', () => {
    expect(selectBlindMirrorsError(state)).toBe('err')
  })
})
