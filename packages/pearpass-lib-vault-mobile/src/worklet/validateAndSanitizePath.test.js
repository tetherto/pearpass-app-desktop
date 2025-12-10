// validateAndSanitizePath.test.js
import barePath from 'bare-path'

import { validateAndSanitizePath } from './validateAndSanitizePath'

// Mock bare-path since it's an external dependency
jest.mock('bare-path', () => ({
  normalize: jest.fn((path) => path.replace(/\/+$/, '')) // Simple mock implementation
}))

describe('validateAndSanitizePath', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw if path is null', () => {
    expect(() => validateAndSanitizePath(null)).toThrow(
      'Storage path must be a non-empty string'
    )
  })

  it('should throw if path is undefined', () => {
    expect(() => validateAndSanitizePath(undefined)).toThrow(
      'Storage path must be a non-empty string'
    )
  })

  it('should throw if path is not a string', () => {
    expect(() => validateAndSanitizePath(123)).toThrow(
      'Storage path must be a non-empty string'
    )
  })

  it('should throw if path is an empty string', () => {
    expect(() => validateAndSanitizePath('')).toThrow(
      'Storage path must be a non-empty string'
    )
  })

  it('should strip file:// protocol', () => {
    barePath.normalize.mockReturnValue('/data/user/0/com.app/files')
    const result = validateAndSanitizePath('file:///data/user/0/com.app/files')
    expect(result).toBe('/data/user/0/com.app/files')
    expect(barePath.normalize).toHaveBeenCalledWith(
      '/data/user/0/com.app/files'
    )
  })

  it('should trim whitespace', () => {
    barePath.normalize.mockReturnValue('/data/path')
    const result = validateAndSanitizePath('  /data/path  ')
    expect(result).toBe('/data/path')
    expect(barePath.normalize).toHaveBeenCalledWith('/data/path')
  })

  it('should throw if path is empty after sanitization', () => {
    expect(() => validateAndSanitizePath('   ')).toThrow(
      'Storage path cannot be empty after sanitization'
    )
    expect(() => validateAndSanitizePath('file://   ')).toThrow(
      'Storage path cannot be empty after sanitization'
    )
  })

  it('should throw if path contains null bytes', () => {
    expect(() => validateAndSanitizePath('/path/with/\0/null')).toThrow(
      'Storage path contains invalid null bytes'
    )
  })

  it('should throw if path is relative (does not start with /)', () => {
    expect(() => validateAndSanitizePath('relative/path')).toThrow(
      'Storage path must be an absolute path'
    )
  })

  it('should throw if path contains parent directory traversal (..)', () => {
    expect(() => validateAndSanitizePath('/path/../traversal')).toThrow(
      'Storage path must not contain traversal sequences (. or ..)'
    )
  })

  it('should throw if path contains current directory traversal (./)', () => {
    expect(() => validateAndSanitizePath('/path/./traversal')).toThrow(
      'Storage path must not contain traversal sequences (. or ..)'
    )
  })

  it('should throw if path contains non-whitelisted hidden file/directory (.hidden)', () => {
    expect(() => validateAndSanitizePath('/path/.hidden')).toThrow(
      'Storage path must not contain traversal sequences (. or ..)'
    )
  })

  it('should allow whitelisted .config directory', () => {
    barePath.normalize.mockReturnValue(
      '/home/username/.config/pear/app-storage/by-random/3892582d20dcf4f12ffa24730bb406bb'
    )
    const result = validateAndSanitizePath(
      '/home/username/.config/pear/app-storage/by-random/3892582d20dcf4f12ffa24730bb406bb'
    )
    expect(result).toBe(
      '/home/username/.config/pear/app-storage/by-random/3892582d20dcf4f12ffa24730bb406bb'
    )
  })

  it('should return a valid absolute path correctly', () => {
    barePath.normalize.mockReturnValue('/valid/absolute/path')
    const result = validateAndSanitizePath('/valid/absolute/path')
    expect(result).toBe('/valid/absolute/path')
  })

  it('should normalize the path using bare-path', () => {
    barePath.normalize.mockReturnValue('/normalized/path')
    const result = validateAndSanitizePath('/normalized/path/')
    expect(result).toBe('/normalized/path')
    expect(barePath.normalize).toHaveBeenCalledWith('/normalized/path/')
  })
})
