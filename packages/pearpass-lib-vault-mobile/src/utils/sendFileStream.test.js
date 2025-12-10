import cenc from 'compact-encoding'

import { sendFileStream } from './sendFileStream'

describe('sendFileStream', () => {
  let mockStream
  let buffer

  beforeEach(() => {
    mockStream = {
      write: jest.fn(() => true),
      end: jest.fn(),
      once: jest.fn()
    }
    buffer = Buffer.from('test data')
  })

  test('throws error if stream is invalid', () => {
    expect(() => sendFileStream({ stream: null, buffer })).toThrow(
      'Invalid stream provided'
    )
    expect(() => sendFileStream({ stream: {}, buffer })).toThrow(
      'Invalid stream provided'
    )
  })

  test('ends stream if no buffer is provided', () => {
    sendFileStream({ stream: mockStream })
    expect(mockStream.end).toHaveBeenCalled()
    expect(mockStream.write).not.toHaveBeenCalled()
  })

  test('writes metadata on first chunk', () => {
    const metaData = { name: 'test.txt' }
    sendFileStream({ stream: mockStream, buffer, metaData })

    expect(mockStream.write).toHaveBeenCalledTimes(2)
    expect(mockStream.write).toHaveBeenNthCalledWith(
      1,
      cenc.encode(cenc.json, metaData)
    )
    expect(mockStream.write).toHaveBeenNthCalledWith(2, buffer)
  })

  test('processes buffer in chunks based on step size', () => {
    const largeBuffer = Buffer.alloc(20000)
    const step = 5000

    sendFileStream({ stream: mockStream, buffer: largeBuffer, step })

    expect(mockStream.write).toHaveBeenCalledTimes(5)
  })

  test('ends stream when no more data to process', () => {
    sendFileStream({ stream: mockStream, buffer })
    expect(mockStream.end).toHaveBeenCalled()
  })

  test('registers drain event handler if stream returns false', () => {
    mockStream.write.mockReturnValueOnce(true).mockReturnValueOnce(false)

    const largeBuffer = Buffer.alloc(20000)
    sendFileStream({ stream: mockStream, buffer: largeBuffer })

    expect(mockStream.once).toHaveBeenCalledWith('drain', expect.any(Function))
  })
})
