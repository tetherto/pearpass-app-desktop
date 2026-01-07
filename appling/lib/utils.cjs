const prettyBytes = require("prettier-bytes");

/**
 * Encodes an object to JSON string for IPC messaging.
 * @param {object} msg - The message object to encode
 * @returns {string} JSON string representation
 */
function encode(msg) {
  return JSON.stringify(msg);
}

/**
 * Decodes a JSON string from IPC messaging.
 * @param {string|Buffer} msg - The message to decode
 * @returns {object|null} Parsed object, or null if parsing fails
 */
function decode(msg) {
  try {
    return JSON.parse(msg.toString());
  } catch (err) {
    console.error("[decode] Failed to parse JSON:", err.message);
    return null;
  }
}

/**
 * Formats download progress data for display.
 * Handles two different progress object formats from the Pear ecosystem.
 * @param {object} u - Progress update object
 * @returns {object} Formatted progress data with speed, progress, peers, bytes
 */
function format(u) {
  // Guard against null/undefined input
  if (!u) {
    return {
      speed: undefined,
      progress: undefined,
      peers: undefined,
      bytes: undefined,
    };
  }

  // Format for Hyperswarm updater (has drive.core property)
  if (u.drive?.core) {
    return {
      speed: prettyBytes(u.downloadSpeed()) + "/s",
      progress: u.downloadProgress,
      peers: u.drive.core.peers.length,
      bytes: u.downloadedBytes,
    };
  }

  // Format for Bootstrap updater (has direct properties)
  return {
    speed:
      u.downloadSpeed === 0 ? undefined : prettyBytes(u.downloadSpeed) + "/s",
    progress: u.downloadProgress === 0 ? undefined : u.downloadProgress,
    peers: u.peers === 0 ? undefined : u.peers,
    bytes: u.downloadedBytes,
  };
}

module.exports = { encode, decode, format };
