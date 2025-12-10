import sodium from 'sodium-native'

/**
 * @param {{
 *   salt: string
 *   password: string
 * }} data
 * @returns {string | undefined}
 */
export const getDecryptionKey = (data) => {
  const salt = Buffer.from(data.salt, 'base64')
  const password = Buffer.from(data.password)

  const hashedPassword = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES)

  const opslimit = sodium.crypto_pwhash_OPSLIMIT_SENSITIVE
  const memlimit = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
  const algo = sodium.crypto_pwhash_ALG_DEFAULT

  sodium.crypto_pwhash(
    hashedPassword,
    Buffer.from(password),
    salt,
    opslimit,
    memlimit,
    algo
  )

  const decryptionKeyHex = Buffer.from(hashedPassword).toString('hex')

  return decryptionKeyHex
}
