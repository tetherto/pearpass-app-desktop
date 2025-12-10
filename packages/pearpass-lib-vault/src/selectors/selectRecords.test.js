import { matchPatternToValue } from 'pear-apps-utils-pattern-search'

import { selectRecords } from './selectRecords'

jest.mock('pear-apps-utils-pattern-search', () => ({
  matchPatternToValue: jest.fn()
}))

describe('selectRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockState = {
    vault: {
      isLoading: false,
      data: {
        records: [
          {
            id: '1',
            folder: 'work',
            data: { title: 'Work Password' },
            type: 'password',
            isFavorite: true,
            createdAt: 100,
            updatedAt: 200
          },
          {
            id: '2',
            folder: 'personal',
            data: { title: 'Personal Password' },
            type: 'password',
            isFavorite: false,
            createdAt: 300,
            updatedAt: 400
          },
          {
            id: '3',
            folder: 'work',
            data: { title: 'Work Note' },
            type: 'note',
            isFavorite: false,
            createdAt: 150,
            updatedAt: 250
          },
          {
            id: '4',
            folder: null,
            data: { title: 'No Folder' },
            type: 'password',
            isFavorite: false,
            createdAt: 50,
            updatedAt: 150
          },
          {
            id: '5',
            folder: 'documents',
            isFavorite: false,
            createdAt: 200,
            updatedAt: 300
          }
        ]
      }
    }
  }

  test('should return all records when no filters are provided', () => {
    const selector = selectRecords()
    const result = selector(mockState)

    expect(result.isLoading).toBe(false)
    expect(result.data).toHaveLength(4)
    expect(result.data[0].id).toBe('1')
  })

  test('should filter by folder', () => {
    const selector = selectRecords({ filters: { folder: 'work' } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(2)
    expect(result.data.every((record) => record.folder === 'work')).toBe(true)
  })

  test('should filter by null folder', () => {
    const selector = selectRecords({ filters: { folder: null } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('4')
  })

  test('should filter by type', () => {
    const selector = selectRecords({ filters: { type: 'note' } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].type).toBe('note')
  })

  test('should filter by favorites', () => {
    const selector = selectRecords({ filters: { isFavorite: true } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].isFavorite).toBe(true)
  })

  test('should include folders when isFolder filter is true', () => {
    const selector = selectRecords({ filters: { isFolder: true } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(5)
  })

  test('should filter by search pattern', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'work') {
        return value.toLowerCase().includes('work')
      }
      return false
    })

    const selector = selectRecords({ filters: { searchPattern: 'work' } })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data.length).toBeGreaterThan(0)
  })

  test('should sort by updatedAt in ascending order', () => {
    const selector = selectRecords({
      sort: { key: 'updatedAt', direction: 'asc' }
    })
    const result = selector(mockState)

    expect(result.data[0].id).toBe('1')
    expect(result.data[1].updatedAt).toBeLessThan(result.data[2].updatedAt)
  })

  test('should sort by updatedAt in descending order', () => {
    const selector = selectRecords({
      sort: { key: 'updatedAt', direction: 'desc' }
    })
    const result = selector(mockState)

    expect(result.data[0].id).toBe('1')
    expect(result.data[1].updatedAt).toBeGreaterThan(result.data[2].updatedAt)
  })

  test('should sort by createdAt', () => {
    const selector = selectRecords({
      sort: { key: 'createdAt', direction: 'desc' }
    })
    const result = selector(mockState)

    expect(result.data[0].id).toBe('1')
    expect(result.data[1].createdAt).toBeGreaterThan(result.data[2].createdAt)
  })

  test('should handle empty state gracefully', () => {
    const emptyState = { vault: {} }
    const selector = selectRecords()
    const result = selector(emptyState)

    expect(result.data).toEqual([])
  })
})
