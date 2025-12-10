import reducer from './blindMirrorsSlice'
import { addBlindMirrors } from '../actions/addBlindMirrors'
import { getBlindMirrors } from '../actions/getBlindMirrors'
import { removeAllBlindMirrors } from '../actions/removeAllBlindMirrors'
import { removeBlindMirror } from '../actions/removeBlindMirror'

const baseState = { isLoading: false, error: null, data: [] }

const withType = (action) => ({ type: action.type, payload: [{ key: 'x' }] })

describe('blindMirrorsSlice', () => {
  it('handles getBlindMirrors lifecycle', () => {
    const pending = reducer(baseState, { type: getBlindMirrors.pending.type })
    expect(pending.isLoading).toBe(true)

    const fulfilled = reducer(baseState, withType(getBlindMirrors.fulfilled))
    expect(fulfilled.isLoading).toBe(false)
    expect(fulfilled.data).toEqual([{ key: 'x' }])

    const rejected = reducer(baseState, {
      type: getBlindMirrors.rejected.type,
      error: 'err'
    })
    expect(rejected.isLoading).toBe(false)
    expect(rejected.error).toBe('err')
  })

  it('handles add/remove/update/all mirrors fulfilled', () => {
    const afterAdd = reducer(baseState, withType(addBlindMirrors.fulfilled))
    expect(afterAdd.data).toEqual([{ key: 'x' }])

    const afterRemoveOne = reducer(
      baseState,
      withType(removeBlindMirror.fulfilled)
    )
    expect(afterRemoveOne.data).toEqual([{ key: 'x' }])

    const afterRemoveAll = reducer(
      baseState,
      withType(removeAllBlindMirrors.fulfilled)
    )
    expect(afterRemoveAll.data).toEqual([{ key: 'x' }])
  })
})
