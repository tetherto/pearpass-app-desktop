import os from 'bare-os'
import path from 'bare-path'

import { getIpcPath } from './getIpcPath'

jest.mock('bare-os')
jest.mock('bare-path')

describe('getIpcPath', () => {
  const socketName = 'test-socket'

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns Windows pipe path when platform is win32', () => {
    os.platform.mockReturnValue('win32')
    const result = getIpcPath(socketName)
    expect(result).toBe('\\\\?\\pipe\\test-socket')
  })

  it('returns Unix socket path in temp directory when platform is not win32', () => {
    os.platform.mockReturnValue('linux')
    os.tmpdir.mockReturnValue('/tmp')
    path.join.mockImplementation((dir, file) => `${dir}/${file}`)

    const result = getIpcPath(socketName)
    expect(result).toBe('/tmp/test-socket.sock')
    expect(path.join).toHaveBeenCalledWith('/tmp', 'test-socket.sock')
  })
})
