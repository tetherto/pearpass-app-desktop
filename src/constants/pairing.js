/**
 * Pairing states for tracking extension pairing confirmation
 */
export const PAIRING_STATES = {
  PENDING: 'PENDING', // getIdentity called, desktop identity key pinned
  CONFIRMED: 'CONFIRMED' // confirmPairing succeeded, final pairing confirmed
}

/**
 * Dispatched on `window` whenever the set of paired browsers changes.
 * Pairing completes over native messaging, outside React, so the settings UI
 * relies on this to know when to reload the list.
 */
export const PAIRED_BROWSERS_CHANGED_EVENT = 'paired-browsers-changed'
