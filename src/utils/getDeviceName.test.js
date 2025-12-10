import os from 'os'

import { getDeviceName } from './getDeviceName'

jest.mock('os')

describe('getDeviceName', () => {
  it('should return the device name in the format "<hostname> <platform> <release>"', () => {
    os.hostname.mockReturnValue('my-host')
    os.platform.mockReturnValue('darwin')
    os.release.mockReturnValue('22.5.0')

    const result = getDeviceName()
    expect(result).toBe('my-host darwin 22.5.0')
  })

  it('should handle empty strings from os methods', () => {
    os.hostname.mockReturnValue('')
    os.platform.mockReturnValue('')
    os.release.mockReturnValue('')

    const result = getDeviceName()
    expect(result).toBe('  ')
  })

  it('should handle special characters in hostname, platform, and release', () => {
    os.hostname.mockReturnValue('host@123')
    os.platform.mockReturnValue('win32!')
    os.release.mockReturnValue('10.0.0#')

    const result = getDeviceName()
    expect(result).toBe('host@123 win32! 10.0.0#')
  })
})
