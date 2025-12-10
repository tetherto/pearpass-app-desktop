import sodium from 'sodium-native'

/**
 *
 * @param {string} hashedPassword
 * @param {Buffer<ArrayBuffer>} key
 * @returns {{
 *   ciphertext: string
 *   nonce: string
 * }}
 */
export const encryptVaultWithKey = (hashedPassword, key) => {
  const nonce = sodium.sodium_malloc(sodium.crypto_secretbox_NONCEBYTES)

  const keyBuffer = Buffer.from(key, 'base64')

  const ciphertext = sodium.sodium_malloc(
    keyBuffer.length + sodium.crypto_secretbox_MACBYTES
  )

  sodium.randombytes_buf(nonce)

  sodium.crypto_secretbox_easy(
    ciphertext,
    keyBuffer,
    nonce,
    Buffer.from(hashedPassword, 'hex')
  )

  return {
    ciphertext: ciphertext.toString('base64'),
    nonce: nonce.toString('base64')
  }
}
