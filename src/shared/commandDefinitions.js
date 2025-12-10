/**
 * Command definitions for the native messaging bridge
 */

/**
 * @typedef {Object} CommandDefinition
 * @property {number} id - Unique command ID
 * @property {string} name - Command name
 */

/** @type {CommandDefinition[]} */
const COMMAND_DEFINITIONS = [
  // Encryption commands
  { id: 1001, name: 'encryptionInit' },
  { id: 1002, name: 'encryptionGetStatus' },
  { id: 1003, name: 'encryptionGet' },
  { id: 1004, name: 'encryptionAdd' },

  // Vaults commands
  { id: 1005, name: 'vaultsInit' },
  { id: 1006, name: 'vaultsGetStatus' },
  { id: 1007, name: 'vaultsGet' },
  { id: 1008, name: 'vaultsList' },
  { id: 1009, name: 'vaultsAdd' },
  { id: 1010, name: 'vaultsClose' },

  // Active vault commands
  { id: 1011, name: 'activeVaultInit' },
  { id: 1012, name: 'activeVaultGetStatus' },
  { id: 1013, name: 'activeVaultGet' },
  { id: 1014, name: 'activeVaultList' },
  { id: 1015, name: 'activeVaultAdd' },
  { id: 1016, name: 'activeVaultRemove' },
  { id: 1017, name: 'activeVaultClose' },
  { id: 1018, name: 'activeVaultCreateInvite' },
  { id: 1019, name: 'activeVaultDeleteInvite' },

  // Password and encryption key commands
  { id: 1020, name: 'hashPassword' },
  { id: 1021, name: 'encryptVaultKeyWithHashedPassword' },
  { id: 1022, name: 'encryptVaultWithKey' },
  { id: 1023, name: 'getDecryptionKey' },
  { id: 1024, name: 'decryptVaultKey' },

  // Native Messaging secure channel (pairing/handshake)
  { id: 1100, name: 'nmGetAppIdentity' },
  // Handshake/session placeholders for Phase 2
  { id: 1102, name: 'nmBeginHandshake' },
  { id: 1103, name: 'nmFinishHandshake' },
  { id: 1104, name: 'nmSecureRequest' },
  { id: 1105, name: 'nmCloseSession' },

  // Pairing and misc commands
  { id: 1025, name: 'pairActiveVault' },
  { id: 1026, name: 'initListener' },
  { id: 1027, name: 'closeAllInstances' },
  { id: 1028, name: 'cancelPairActiveVault' },

  { id: 1029, name: 'recordFailedMasterPassword' },
  { id: 1030, name: 'getMasterPasswordStatus' },

  { id: 1031, name: 'activeVaultRemoveFile' }
]

/** @type {string[]} */
const COMMAND_NAMES = COMMAND_DEFINITIONS.map((cmd) => cmd.name)

/**
 * Check if a command name is valid
 * @param {string} commandName - The command name to validate
 * @returns {boolean}
 */
const isValidCommand = (commandName) => COMMAND_NAMES.includes(commandName)

export { COMMAND_DEFINITIONS, isValidCommand }
