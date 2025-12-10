/**
 * Returns an appropriate app name based on the app type.
 *
 * @param {'MOBILE' | 'DESKTOP' | 'BROWSER_EXTENSION'} appType
 * @returns {string}
 */
export const getAppNameByType = (appType) => {
  switch (appType) {
    case 'MOBILE':
      return 'Mobile'
    case 'DESKTOP':
      return 'Desktop'
    case 'BROWSER_EXTENSION':
      return 'Browser Extension'
    default:
      return 'Unknown'
  }
}
