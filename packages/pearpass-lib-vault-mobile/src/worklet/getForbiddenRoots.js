/** @typedef {import('bare')} */ /* global Bare */

/**
 * Get platform-specific forbidden system directories
 * @returns {string[]} List of forbidden root directories
 */
export const getForbiddenRoots = () => {
  // Detect platform using Bare runtime'sz platform property
  const isWindows = Bare.platform === 'win32'
  const isMac = Bare.platform === 'darwin'

  if (isWindows) {
    // Windows system directories (case-insensitive filesystem)
    // These are protected by TrustedInstaller and should never contain user app data
    return [
      'C:\\Windows',
      'C:\\Windows\\System32',
      'C:\\Windows\\SysWOW64',
      'C:\\Program Files',
      'C:\\Program Files (x86)',
      'C:\\Program Files\\WindowsApps',
      'C:\\ProgramData',
      'C:\\System Volume Information'
    ]
  }

  if (isMac) {
    // macOS-specific system directories protected by System Integrity Protection (SIP)
    return [
      '/bin',
      '/sbin',
      '/usr/bin',
      '/usr/sbin',
      '/etc',
      '/var',
      '/tmp',
      '/root',
      '/boot',
      '/sys',
      '/proc',
      '/dev',
      '/System',
      '/Library',
      '/private'
    ]
  }

  // Unix/Linux system directories (FHS-compliant)
  return [
    '/bin',
    '/sbin',
    '/usr/bin',
    '/usr/sbin',
    '/etc',
    '/var',
    '/tmp',
    '/root',
    '/boot',
    '/sys',
    '/proc',
    '/dev',
    '/lib',
    '/lib64'
  ]
}
