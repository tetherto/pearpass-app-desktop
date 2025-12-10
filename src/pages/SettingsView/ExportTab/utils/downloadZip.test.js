import JSZip from 'jszip'

import { downloadZip } from './downloadZip'

jest.mock('jszip')

describe('downloadZip', () => {
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
      createObjectURL: jest.fn().mockReturnValue('blob:mock-zip-url'),
      revokeObjectURL: jest.fn()
    }
    createObjectURLSpy = global.URL.createObjectURL
    revokeObjectURLSpy = global.URL.revokeObjectURL

    JSZip.mockClear()
    JSZip.mockImplementation(() => ({
      file: jest.fn(),
      generateAsync: jest.fn().mockResolvedValue('mock-blob')
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    global.URL = originalURL
  })

  it('should create a zip file with the provided files and trigger download', async () => {
    const files = [
      { filename: 'file1.txt', data: 'data1' },
      { filename: 'file2.txt', data: 'data2' }
    ]
    await downloadZip(files)

    expect(JSZip).toHaveBeenCalledTimes(1)
    const zipInstance = JSZip.mock.results[0].value
    expect(zipInstance.file).toHaveBeenCalledWith('file1.txt', 'data1')
    expect(zipInstance.file).toHaveBeenCalledWith('file2.txt', 'data2')
    expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' })
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(createObjectURLSpy).toHaveBeenCalledWith('mock-blob')
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-zip-url')
  })

  it('should set the correct filename pattern on the link', async () => {
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
    await downloadZip([{ filename: 'test.txt', data: 'abc' }])
    expect(link.download).toMatch(
      /^PearPass_Export_\d{4}_\d{2}_\d{2}T\d{2}_\d{2}_\d{2}_\d{3}Z\.zip$/
    )
  })
})
