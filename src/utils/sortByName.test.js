import { sortByName } from './sortByName'

describe('sortByName', () => {
  it('sorts items alphabetically by name', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alpha' }, { name: 'Beta' }]
    const result = sortByName(items)
    expect(result.map((i) => i.name)).toEqual(['Alpha', 'Beta', 'Charlie'])
  })

  it('handles case-insensitive sorting', () => {
    const items = [{ name: 'beta' }, { name: 'Alpha' }, { name: 'CHARLIE' }]
    const result = sortByName(items)
    expect(result.map((i) => i.name)).toEqual(['Alpha', 'beta', 'CHARLIE'])
  })

  it('returns empty array for null/undefined input', () => {
    expect(sortByName(null)).toEqual([])
    expect(sortByName(undefined)).toEqual([])
  })

  it('does not mutate original array', () => {
    const original = [{ name: 'B' }, { name: 'A' }]
    const result = sortByName(original)
    expect(original[0].name).toBe('B')
    expect(result[0].name).toBe('A')
  })

  it('returns empty array for empty input', () => {
    expect(sortByName([])).toEqual([])
  })

  it('handles single item array', () => {
    const items = [{ name: 'Single' }]
    const result = sortByName(items)
    expect(result).toEqual([{ name: 'Single' }])
  })
})
