import sodium from 'sodium-native'

/**
 *
 * @param {string} password
 * @returns {{
 *   salt: string
 *   hashedPassword: string
 * }}
 */
export const hashPassword = (password) => {
  const salt = sodium.sodium_malloc(sodium.crypto_pwhash_SALTBYTES)

  sodium.randombytes_buf(salt)

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

  return {
    hashedPassword: Buffer.from(hashedPassword).toString('hex'),
    salt: salt.toString('base64')
  }
}
