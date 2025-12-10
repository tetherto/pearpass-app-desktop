import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { processFiles } from './processFiles'

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('processFiles', () => {
  const mockBuffer = new ArrayBuffer(8)
  const mockId = 'unique-id-123'

  beforeEach(() => {
    jest.clearAllMocks()
    generateUniqueId.mockReturnValue(mockId)
  })

  it('should return empty arrays when input is empty', () => {
    expect(processFiles()).toEqual({ files: [], buffersWithId: [] })
    expect(processFiles([])).toEqual({ files: [], buffersWithId: [] })
  })

  it('should skip falsy file entries', () => {
    const files = [null, undefined, false]
    expect(processFiles(files)).toEqual({ files: [], buffersWithId: [] })
  })

  it('should process files with existing id', () => {
    const files = [{ id: 'abc', buffer: mockBuffer, name: 'file1.txt' }]
    expect(processFiles(files)).toEqual({
      files: [{ id: 'abc', name: 'file1.txt' }],
      buffersWithId: []
    })
  })

  it('should assign id and name to files without id', () => {
    const files = [{ buffer: mockBuffer, name: 'test.txt' }]
    const result = processFiles(files)
    expect(generateUniqueId).toHaveBeenCalled()
    expect(result.files).toEqual([{ id: mockId, name: 'test.txt' }])
    expect(result.buffersWithId).toEqual([
      { id: mockId, buffer: mockBuffer, name: 'test.txt' }
    ])
  })

  it('should assign default name if name is missing', () => {
    const files = [{ buffer: mockBuffer }]
    const result = processFiles(files)
    expect(result.files[0].name).toBe(`file-${mockId}`)
  })

  it('should process a mix of files with and without id', () => {
    const files = [
      { id: 'id1', buffer: mockBuffer, name: 'file2.txt' },
      { buffer: mockBuffer, name: 'file2.txt' }
    ]
    const result = processFiles(files)
    expect(result.files).toEqual([
      { id: 'id1', name: 'file2.txt' },
      { id: mockId, name: 'file2.txt' }
    ])
    expect(result.buffersWithId).toEqual([
      { id: mockId, buffer: mockBuffer, name: 'file2.txt' }
    ])
  })
})
