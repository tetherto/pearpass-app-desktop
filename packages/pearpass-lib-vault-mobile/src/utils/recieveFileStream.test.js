import { Buffer } from 'buffer'
import { EventEmitter } from 'events'

import cenc from 'compact-encoding'

import { receiveFileStream } from './recieveFileStream'

function createMockStream() {
  return new EventEmitter()
}

describe('receiveFileStream', () => {
  it('should extract metadata and content from a stream', async () => {
    const mockStream = createMockStream()

    const testMetadata = { name: 'test.txt', type: 'text/plain', size: 123 }
    const encodedMetadata = cenc.encode(cenc.json, testMetadata)
    const testContent = Buffer.from('Hello, world!')

    const resultPromise = receiveFileStream(mockStream)

    mockStream.emit('data', encodedMetadata)
    mockStream.emit('data', testContent)

    mockStream.emit('end')

    const result = await resultPromise

    expect(result.metaData).toEqual(testMetadata)
    expect(result.buffer.toString()).toBe('Hello, world!')
  })

  it('should handle multiple content chunks correctly', async () => {
    const mockStream = createMockStream()

    const testMetadata = { name: 'test.txt', type: 'text/plain', size: 246 }
    const encodedMetadata = cenc.encode(cenc.json, testMetadata)
    const chunk1 = Buffer.from('First chunk, ')
    const chunk2 = Buffer.from('second chunk, ')
    const chunk3 = Buffer.from('third chunk!')

    const resultPromise = receiveFileStream(mockStream)

    mockStream.emit('data', encodedMetadata)
    mockStream.emit('data', chunk1)
    mockStream.emit('data', chunk2)
    mockStream.emit('data', chunk3)
    mockStream.emit('end')

    const result = await resultPromise

    expect(result.metaData).toEqual(testMetadata)
    expect(result.buffer.toString()).toBe(
      'First chunk, second chunk, third chunk!'
    )
  })

  it('should reject with an error when stream emits an error', async () => {
    const mockStream = createMockStream()
    const testError = new Error('Stream error')

    const resultPromise = receiveFileStream(mockStream)

    mockStream.emit('error', testError)

    await expect(resultPromise).rejects.toThrow('Stream error')
  })

  it('should handle empty content after metadata', async () => {
    const mockStream = createMockStream()

    const testMetadata = { name: 'empty.txt', type: 'text/plain', size: 0 }
    const encodedMetadata = cenc.encode(cenc.json, testMetadata)

    const resultPromise = receiveFileStream(mockStream)

    mockStream.emit('data', encodedMetadata)
    mockStream.emit('end')

    const result = await resultPromise

    expect(result.metaData).toEqual(testMetadata)
    expect(result.buffer.length).toBe(0)
  })
})
