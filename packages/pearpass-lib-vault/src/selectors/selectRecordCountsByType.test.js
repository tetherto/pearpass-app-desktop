import { selectRecordCountsByType } from './selectRecordCountsByType'
import { RECORD_TYPES } from '../constants/recordTypes'

describe('selectRecordCountsByType', () => {
  const mockState = {
    vault: {
      isLoading: false,
      data: {
        records: [
          { type: RECORD_TYPES.LOGIN, folder: 'folder1', isFavorite: true },
          { type: RECORD_TYPES.NOTE, folder: 'folder1', isFavorite: false },
          { type: RECORD_TYPES.LOGIN, folder: 'folder2', isFavorite: false },
          {
            type: RECORD_TYPES.CREDIT_CARD,
            folder: 'folder2',
            isFavorite: true
          },
          { type: RECORD_TYPES.IDENTITY, folder: 'folder3', isFavorite: true },
          { type: RECORD_TYPES.CUSTOM, folder: 'folder3', isFavorite: false }
        ]
      }
    }
  }

  it('should return counts of all record types', () => {
    const selector = selectRecordCountsByType()
    const result = selector(mockState)

    expect(result.isLoading).toBe(false)
    expect(result.data).toEqual({
      all: 6,
      [RECORD_TYPES.LOGIN]: 2,
      [RECORD_TYPES.NOTE]: 1,
      [RECORD_TYPES.CREDIT_CARD]: 1,
      [RECORD_TYPES.IDENTITY]: 1,
      [RECORD_TYPES.CUSTOM]: 1,
      [RECORD_TYPES.WIFI_PASSWORD]: 0,
      [RECORD_TYPES.PASS_PHRASE]: 0
    })
  })

  it('should filter records by folder', () => {
    const selector = selectRecordCountsByType({
      filters: { folder: 'folder1' }
    })
    const result = selector(mockState)

    expect(result.data).toEqual({
      all: 2,
      [RECORD_TYPES.LOGIN]: 1,
      [RECORD_TYPES.NOTE]: 1,
      [RECORD_TYPES.CREDIT_CARD]: 0,
      [RECORD_TYPES.IDENTITY]: 0,
      [RECORD_TYPES.CUSTOM]: 0,
      [RECORD_TYPES.WIFI_PASSWORD]: 0,
      [RECORD_TYPES.PASS_PHRASE]: 0
    })
  })

  it('should filter records by null folder', () => {
    const stateWithNullFolder = {
      vault: {
        isLoading: false,
        data: {
          records: [
            ...mockState.vault.data.records,
            { type: RECORD_TYPES.LOGIN, folder: null, isFavorite: false }
          ]
        }
      }
    }

    const selector = selectRecordCountsByType({ filters: { folder: null } })
    const result = selector(stateWithNullFolder)

    expect(result.data.all).toBe(1)
    expect(result.data[RECORD_TYPES.LOGIN]).toBe(1)
  })

  it('should filter records by favorite status', () => {
    const selector = selectRecordCountsByType({ filters: { isFavorite: true } })
    const result = selector(mockState)

    expect(result.data).toEqual({
      all: 3,
      [RECORD_TYPES.LOGIN]: 1,
      [RECORD_TYPES.NOTE]: 0,
      [RECORD_TYPES.CREDIT_CARD]: 1,
      [RECORD_TYPES.IDENTITY]: 1,
      [RECORD_TYPES.CUSTOM]: 0,
      [RECORD_TYPES.WIFI_PASSWORD]: 0,
      [RECORD_TYPES.PASS_PHRASE]: 0
    })
  })

  it('should filter by both folder and favorite status', () => {
    const selector = selectRecordCountsByType({
      filters: { folder: 'folder1', isFavorite: true }
    })
    const result = selector(mockState)

    expect(result.data).toEqual({
      all: 1,
      [RECORD_TYPES.LOGIN]: 1,
      [RECORD_TYPES.NOTE]: 0,
      [RECORD_TYPES.CREDIT_CARD]: 0,
      [RECORD_TYPES.IDENTITY]: 0,
      [RECORD_TYPES.CUSTOM]: 0,
      [RECORD_TYPES.WIFI_PASSWORD]: 0,
      [RECORD_TYPES.PASS_PHRASE]: 0
    })
  })

  it('should return default values when vault data is not available', () => {
    const emptyState = { vault: {} }
    const selector = selectRecordCountsByType()
    const result = selector(emptyState)

    expect(result.data).toEqual({
      all: 0,
      [RECORD_TYPES.LOGIN]: 0,
      [RECORD_TYPES.NOTE]: 0,
      [RECORD_TYPES.CREDIT_CARD]: 0,
      [RECORD_TYPES.IDENTITY]: 0,
      [RECORD_TYPES.CUSTOM]: 0,
      [RECORD_TYPES.WIFI_PASSWORD]: 0,
      [RECORD_TYPES.PASS_PHRASE]: 0
    })
  })

  it('should exclude records with undefined type', () => {
    const stateWithUndefinedType = {
      vault: {
        data: {
          records: [
            ...mockState.vault.data.records,
            { folder: 'folder1', isFavorite: true }
          ]
        }
      }
    }

    const selector = selectRecordCountsByType()
    const result = selector(stateWithUndefinedType)

    expect(result.data.all).toBe(6)
  })
})
