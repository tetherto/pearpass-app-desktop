import sodium from 'sodium-native'

/**
 * @param {{
 *   ciphertext: string
 *   nonce: string
 *   hashedPassword: string
 * }} data
 * @returns {string | undefined}
 */
export const decryptVaultKey = (data) => {
  const ciphertext = Buffer.from(data.ciphertext, 'base64')
  const nonce = Buffer.from(data.nonce, 'base64')

  const hashedPassword = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES)
  Buffer.from(data.hashedPassword, 'hex').copy(hashedPassword)

  const plainText = sodium.sodium_malloc(
    ciphertext.length - sodium.crypto_secretbox_MACBYTES
  )

  if (
    !sodium.crypto_secretbox_open_easy(
      plainText,
      ciphertext,
      nonce,
      hashedPassword
    )
  ) {
    return undefined
  }

  return plainText.toString('base64')
}
