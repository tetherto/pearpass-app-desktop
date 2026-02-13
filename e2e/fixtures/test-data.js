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
  },

  // PassPhrase
  passphrase: {
    text12: "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12",
    text24: "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24"
  }
}
