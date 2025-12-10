/**
 * Filters out an attachment from the list of attachments by its `tempId` or `id`.
 *
 * @param {Array<Object>} attachments - The array of attachment objects to filter.
 * @param {Object} attachment - The attachment object to exclude from the result.
 * @param {string} [attachment.tempId] - The temporary ID of the attachment (if available).
 * @param {string|number} [attachment.id] - The permanent ID of the attachment (if available).
 * @returns {Array<Object>} The filtered array of attachments excluding the specified attachment.
 */
export const getFilteredAttachmentsById = (attachments, attachment) =>
  attachments?.filter((a) => {
    if (attachment.tempId) {
      return a.tempId !== attachment.tempId
    }
    if (attachment.id) {
      return a.id !== attachment.id
    }
    return true
  }) || []
