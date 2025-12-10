/**
 * Returns an appropriate title for a feedback based on its topic.
 *
 * @param {'BUG_REPORT' | 'FEATURE_REQUEST' | 'SECURITY_ISSUE'} topic
 * @returns {string}
 */
export const getTitleByTopic = (topic) => {
  switch (topic) {
    case 'BUG_REPORT':
      return 'Bug report'
    case 'FEATURE_REQUEST':
      return 'Feature request'
    case 'SECURITY_ISSUE':
      return 'Security issue'
    default:
      return 'Feedback from User'
  }
}
