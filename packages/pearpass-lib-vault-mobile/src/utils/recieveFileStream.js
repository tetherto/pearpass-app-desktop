import { Buffer } from 'buffer'

import cenc from 'compact-encoding'

/**
 * Receives a file stream and extracts metaData and content from it.
 * The function expects the first chunk of the stream to contain metaData encoded with compact-encoding,
 * and all subsequent chunks to be the file content.
 *
 * @async
 * @param {ReadableStream} stream
 * @returns {Promise<{
 *   content: Buffer,
 *   metaData: Object
 * }>}
 * @throws {Error}
 */
export const receiveFileStream = async (stream) =>
  new Promise((resolve, reject) => {
    let metaData = null
    let chunks = Buffer.from([])

    stream.on('data', (data) => {
      if (!metaData) {
        const decodedMetadata = cenc.decode(cenc.json, data)

        metaData = decodedMetadata

        return
      }

      chunks = Buffer.concat([chunks, data])
    })

    stream.on('end', () => {
      resolve({
        buffer: chunks,
        metaData
      })
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
