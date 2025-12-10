import os from 'os'

/**
 * Returns a string representing the device name, composed of the hostname, platform, and OS release.
 *
 * @returns {string} The device name in the format: "<hostname> <platform> <release>".
 */
export const getDeviceName = () =>
  [os.hostname(), os.platform(), os.release()].join(' ')
