import { handleFileSelect } from './handleFileSelect'
import { logger } from './logger'
import { readFileContent } from '../pages/SettingsView/ImportTab/utils/readFileContent'

jest.mock('./logger', () => ({
  logger: { error: jest.fn() }
}))
jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn(() => 'unique-id')
}))

jest.mock('../pages/SettingsView/ImportTab/utils/readFileContent', () => ({
  readFileContent: jest.fn()
}))

describe('handleFileSelect', () => {
  const setValue = jest.fn()
  const fieldName = 'files'
  const values = {
    files: [{ buffer: new Uint8Array([1, 2]), name: 'old.txt' }]
  }
  const file = new File(['test'], 'test.txt')
  const files = [file]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should read file and call setValue with new buffer and filename', async () => {
    const arrayBuffer = new Uint8Array([10, 20, 30]).buffer
    readFileContent.mockResolvedValueOnce(arrayBuffer)

    await handleFileSelect({ files, fieldName, setValue, values })

    await Promise.resolve()

    expect(readFileContent).toHaveBeenCalledWith(file, { as: 'buffer' })
    expect(setValue).toHaveBeenCalledWith(fieldName, [
      ...values[fieldName],
      {
        buffer: new Uint8Array(arrayBuffer),
        name: 'test.txt',
        tempId: 'unique-id'
      }
    ])
  })

  it('should log error if readFileContent rejects', async () => {
    const error = new Error('Failed to read')
    readFileContent.mockRejectedValueOnce(error)

    await handleFileSelect({ files, fieldName, setValue, values })

    await Promise.resolve()

    expect(logger.error).toHaveBeenCalledWith(
      'useGetMultipleFiles',
      'Error reading file:',
      error
    )
    expect(setValue).not.toHaveBeenCalled()
  })
})
