/**
 * @param { string } string
 * @returns { string }
 */
export const toSentenceCase = (string) => {
  if (!string) {
    return string
  }

  return string.charAt(0).toUpperCase() + string.slice(1)
}
