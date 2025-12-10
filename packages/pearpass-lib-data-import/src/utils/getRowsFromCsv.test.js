import { getRowsFromCsv } from './getRowsFromCsv'

describe('getRowsFromCsv', () => {
  it('parses simple CSV', () => {
    const csv = 'a,b,c\nd,e,f'
    expect(getRowsFromCsv(csv)).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f']
    ])
  })

  it('handles quoted fields with commas', () => {
    const csv = '"a,b",c,"d,e"\nf,g,h'
    expect(getRowsFromCsv(csv)).toEqual([
      ['a,b', 'c', 'd,e'],
      ['f', 'g', 'h']
    ])
  })

  it('handles quoted fields with newlines', () => {
    const csv = '"a\nb",c\nd,e,f'
    expect(getRowsFromCsv(csv)).toEqual([
      ['a\nb', 'c'],
      ['d', 'e', 'f']
    ])
  })

  it('handles escaped quotes inside quoted fields', () => {
    const csv = '"a""b",c'
    expect(getRowsFromCsv(csv)).toEqual([['a"b', 'c']])
  })

  it('handles empty fields', () => {
    const csv = 'a,,c\n,,'
    expect(getRowsFromCsv(csv)).toEqual([
      ['a', '', 'c'],
      ['', '', '']
    ])
  })

  it('handles trailing newline', () => {
    const csv = 'a,b,c\n'
    expect(getRowsFromCsv(csv)).toEqual([['a', 'b', 'c']])
  })

  it('handles carriage returns', () => {
    const csv = 'a,b,c\r\nd,e,f\r\n'
    expect(getRowsFromCsv(csv)).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f']
    ])
  })

  it('handles single field', () => {
    const csv = 'abc'
    expect(getRowsFromCsv(csv)).toEqual([['abc']])
  })

  it('handles completely empty input', () => {
    expect(getRowsFromCsv('')).toEqual([['']])
  })

  it('handles quoted empty field', () => {
    const csv = '"",b'
    expect(getRowsFromCsv(csv)).toEqual([['', 'b']])
  })

  it('handles spaces around fields', () => {
    const csv = ' a , "b" ,c '
    expect(getRowsFromCsv(csv)).toEqual([['a', 'b', 'c']])
  })

  it('handles only newlines', () => {
    expect(getRowsFromCsv('\n')).toEqual([['']])
    expect(getRowsFromCsv('\r\n')).toEqual([['']])
  })

  it('handles quoted field at end of line', () => {
    const csv = 'a,"b"\nc,"d"'
    expect(getRowsFromCsv(csv)).toEqual([
      ['a', 'b'],
      ['c', 'd']
    ])
  })

  it('handles multiple consecutive quotes', () => {
    const csv = '"""a""",b'
    expect(getRowsFromCsv(csv)).toEqual([['"a"', 'b']])
  })
})
