// validateAndSanitizePath.js
import barePath from 'bare-path'

const WHITELISTED_DOT_DIRS = ['.config']

/**
 * Validates and sanitizes a storage path
 * @param {string} rawPath - The raw path to validate
 * @returns {string} - The sanitized path
 * @throws {Error} - If path is invalid or unsafe
 */
export const validateAndSanitizePath = (rawPath) => {
  if (!rawPath || typeof rawPath !== 'string') {
    throw new Error('Storage path must be a non-empty string')
  }

  // Strip file:// protocol if present
  let cleanPath = rawPath
  if (cleanPath.startsWith('file://')) {
    cleanPath = cleanPath.substring('file://'.length)
  }

  // Trim whitespace
  cleanPath = cleanPath.trim()

  if (cleanPath.length === 0) {
    throw new Error('Storage path cannot be empty after sanitization')
  }

  // Check for null bytes before any processing (path traversal attack vector)
  if (cleanPath.includes('\0')) {
    throw new Error('Storage path contains invalid null bytes')
  }

  if (!barePath.isAbsolute(cleanPath)) {
    throw new Error('Storage path must be an absolute path')
  }

  // Reject any path containing traversal sequences, except whitelisted dot directories
  if (cleanPath.includes('..') || cleanPath.includes('./')) {
    throw new Error(
      'Storage path must not contain traversal sequences (. or ..)'
    )
  }

  // Check for other dot sequences that aren't whitelisted
  const dotPattern = /\/\.([^/]+)/g
  const matches = [...cleanPath.matchAll(dotPattern)]
  for (const match of matches) {
    if (!WHITELISTED_DOT_DIRS.includes(`.${match[1]}`)) {
      throw new Error(
        'Storage path must not contain traversal sequences (. or ..)'
      )
    }
  }

  // Normalize path to remove redundant slashes and trailing slashes
  cleanPath = barePath.normalize(cleanPath)

  return cleanPath
}
