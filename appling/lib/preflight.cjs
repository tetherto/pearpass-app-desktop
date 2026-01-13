const appling = require("appling-native");

/**
 * Performs pre-installation checks to determine if the app is already installed.
 *
 * @param {string} id - The Pear application ID (z32 encoded public key)
 * @returns {Promise<{lock: object, needsInstall: boolean, launched: boolean}>}
 *   - lock: The installation lock (null if app was launched)
 *   - needsInstall: true if installation is required
 *   - launched: true if the app was already installed and has been launched
 */
async function preflight(id) {
  // Acquire lock without specifying dir - appling-native uses default location
  const lock = await appling.lock();

  let platform;
  try {
    platform = await appling.resolve();
  } catch (err) {
    // Platform not found - installation required
    return { lock, needsInstall: true, launched: false };
  }

  const ready = platform.ready(`pear://${id}`);

  if (ready === false) {
    return { lock, needsInstall: true, launched: false };
  }

  // App is already installed and ready - launch it directly
  await lock.unlock();
  platform.launch(id);

  // Return sentinel value indicating app was launched
  // Caller should exit the process after receiving this
  return { lock: null, needsInstall: false, launched: true };
}

module.exports = { preflight };
