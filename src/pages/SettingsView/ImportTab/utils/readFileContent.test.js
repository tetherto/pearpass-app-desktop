import { readFileContent } from './readFileContent'

describe('readFileContent', () => {
  let fileMock
  let fileReaderMock
  let originalFileReader

  beforeEach(() => {
    fileMock = new Blob(['test content'], { type: 'text/plain' })
    originalFileReader = global.FileReader

    fileReaderMock = {
      readAsText: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onload: null,
      onerror: null,
      result: 'test content'
    }

    global.FileReader = jest.fn(() => fileReaderMock)
  })

  afterEach(() => {
    global.FileReader = originalFileReader
    jest.clearAllMocks()
  })

  it('should resolve with file content on successful read', async () => {
    const promise = readFileContent(fileMock)
    fileReaderMock.onload({ target: { result: 'test content' } })
    await expect(promise).resolves.toBe('test content')
    expect(fileReaderMock.readAsText).toHaveBeenCalledWith(fileMock)
  })

  it('should reject if there is a read error', async () => {
    const promise = readFileContent(fileMock)
    const errorEvent = new Event('error')
    fileReaderMock.onerror(errorEvent)
    await expect(promise).rejects.toBe(errorEvent)
    expect(fileReaderMock.readAsText).toHaveBeenCalledWith(fileMock)
  })
})
