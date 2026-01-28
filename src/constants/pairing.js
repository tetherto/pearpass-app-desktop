/**
 * Pairing states for tracking extension pairing confirmation
 */
export const PAIRING_STATES = {
  PENDING: 'PENDING', // getIdentity called, desktop identity key pinned
  CONFIRMED: 'CONFIRMED' // confirmPairing succeeded, final pairing confirmed
}
