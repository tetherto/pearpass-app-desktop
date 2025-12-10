import { downloadFile } from './downloadFile'

describe('downloadFile', () => {
  let createElementSpy
  let createObjectURLSpy
  let revokeObjectURLSpy
  let clickMock
  let originalURL

  beforeEach(() => {
    clickMock = jest.fn()
    createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation(() => ({
        set href(val) {
          this._href = val
        },
        get href() {
          return this._href
        },
        set download(val) {
          this._download = val
        },
        get download() {
          return this._download
        },
        click: clickMock
      }))
    originalURL = global.URL
    global.URL = {
      createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: jest.fn()
    }
    createObjectURLSpy = global.URL.createObjectURL
    revokeObjectURLSpy = global.URL.revokeObjectURL
  })

  afterEach(() => {
    jest.restoreAllMocks()
    global.URL = originalURL
  })

  it('should create a JSON blob and trigger download', () => {
    downloadFile({ filename: 'test.json', content: '{"a":1}' }, 'json')
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should create a CSV blob and trigger download', () => {
    downloadFile({ filename: 'test.csv', content: 'a,b\n1,2' }, 'csv')
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should set the correct filename on the link', () => {
    let link
    createElementSpy.mockImplementation(() => {
      link = {
        set href(val) {
          this._href = val
        },
        get href() {
          return this._href
        },
        set download(val) {
          this._download = val
        },
        get download() {
          return this._download
        },
        click: clickMock
      }
      return link
    })
    downloadFile({ filename: 'file.csv', content: 'x' }, 'csv')
    expect(link.download).toBe('file.csv')
  })
})
