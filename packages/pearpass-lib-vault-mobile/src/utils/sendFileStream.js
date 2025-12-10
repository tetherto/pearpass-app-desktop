import cenc from 'compact-encoding'

export const sendFileStream = ({
  stream,
  buffer,
  start = 0,
  step = 8192,
  metaData = {}
}) => {
  let chunk

  if (!stream || !stream.write) {
    throw new Error('Invalid stream provided. Ensure it is a writable stream.')
  }

  if (!buffer) {
    stream.end()
    return
  }

  if (start === 0) {
    stream.write(cenc.encode(cenc.json, metaData))
  }

  do {
    chunk = buffer?.subarray(start, start + step)

    if (!chunk?.length) {
      return stream.end()
    }

    start += step
  } while (stream.write(chunk))

  stream.once('drain', () => sendFileStream({ stream, buffer, start, step }))
}
