export let pearpassVaultClient

/**
 * @param {Autopass} instance
 */
export const setPearpassVaultClient = (instance) => {
  pearpassVaultClient = instance
}

/**
 * @param {string} path
 */
export const setStoragePath = async (path) => {
  await pearpassVaultClient.setStoragePath(path)
}
