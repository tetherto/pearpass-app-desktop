/**
 * Protocol wrapper for native messaging
 */

/**
 * @typedef {Object} WrappedMessage
 * @property {number} length - Original message length in bytes
 * @property {Object} message - The actual message
 */

/**
 * Wrap a message with protocol metadata
 * @param {Object} message - The message to wrap
 * @returns {WrappedMessage}
 */
export const wrapMessage = (message) => {
  const originalJson = JSON.stringify(message)
  const originalLength = Buffer.from(originalJson).length

  return {
    length: originalLength,
    message
  }
}

/**
 * Unwrap a message from protocol
 * @param {WrappedMessage} wrapped - The wrapped message
 * @returns {Object|null} The original message or null if invalid
 */
export const unwrapMessage = (wrapped) => {
  if (!isWrappedMessage(wrapped)) return null

  const messageJson = JSON.stringify(wrapped.message)
  const actualLength = Buffer.from(messageJson).length

  if (actualLength !== wrapped.length) {
    return null
  }

  return wrapped.message
}

/**
 * Check if a message is wrapped
 * @param {*} message - The message to check
 * @returns {boolean}
 */
export const isWrappedMessage = (message) =>
  !!message &&
  typeof message === 'object' &&
  Object.keys(message).length === 2 &&
  'length' in message &&
  typeof message.length === 'number' &&
  'message' in message
