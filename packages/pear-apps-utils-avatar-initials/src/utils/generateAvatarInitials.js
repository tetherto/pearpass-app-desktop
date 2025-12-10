/**
 * @param {string} name
 * @returns {string}
 */
export const generateAvatarInitials = (name) => {
  if (typeof name !== 'string') {
    return ''
  }

  const nameParts = name.split(' ')

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase()
  }

  return nameParts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
