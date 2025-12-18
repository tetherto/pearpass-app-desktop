'use strict'

/**
 * Centralized test data for reuse across test suites
 */
module.exports = {
  // User credentials
  credentials: {
    validPassword: 'Test123!',
    invalidPassword: 'WrongPassword123!'
  },

  // Vault data
  vault: {
    name: 'Test'
  },

  // Timeouts
  timeouts: {
    navigation: 3000,
    action: 2000
  }
}
