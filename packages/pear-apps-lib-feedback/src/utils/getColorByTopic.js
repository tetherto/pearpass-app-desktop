/**
 *
 * @param {'BUG_REPORT' | 'FEATURE_REQUEST' | 'SECURITY_ISSUE'} topic
 * @returns {string}
 */
export const getColorByTopic = (topic) => {
  switch (topic) {
    case 'BUG_REPORT':
      return '#FF5733'
    case 'FEATURE_REQUEST':
      return '#33FF57'
    case 'SECURITY_ISSUE':
      return '#3357FF'
    default:
      return '#FFFFFF'
  }
}
