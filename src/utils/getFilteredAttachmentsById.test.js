import { getFilteredAttachmentsById } from './getFilteredAttachmentsById'

describe('getFilteredAttachmentsById', () => {
  const attachments = [
    { id: 1, tempId: 'abc', name: 'file1' },
    { id: 2, tempId: 'def', name: 'file2' },
    { id: 3, tempId: 'ghi', name: 'file3' },
    { id: 4, name: 'file4' }
  ]

  it('filters out attachment by tempId', () => {
    const attachmentToRemove = { tempId: 'def' }
    const result = getFilteredAttachmentsById(attachments, attachmentToRemove)
    expect(result).toEqual([
      { id: 1, tempId: 'abc', name: 'file1' },
      { id: 3, tempId: 'ghi', name: 'file3' },
      { id: 4, name: 'file4' }
    ])
  })

  it('filters out attachment by id', () => {
    const attachmentToRemove = { id: 3 }
    const result = getFilteredAttachmentsById(attachments, attachmentToRemove)
    expect(result).toEqual([
      { id: 1, tempId: 'abc', name: 'file1' },
      { id: 2, tempId: 'def', name: 'file2' },
      { id: 4, name: 'file4' }
    ])
  })

  it('returns original array if neither tempId nor id is provided', () => {
    const attachmentToRemove = { name: 'file2' }
    const result = getFilteredAttachmentsById(attachments, attachmentToRemove)
    expect(result).toEqual(attachments)
  })

  it('returns empty array if attachments is empty', () => {
    const attachmentToRemove = { tempId: 'abc' }
    const result = getFilteredAttachmentsById([], attachmentToRemove)
    expect(result).toEqual([])
  })

  it('does not filter if tempId or id does not match any attachment', () => {
    const attachmentToRemove = { tempId: 'xyz', id: 999 }
    const result = getFilteredAttachmentsById(attachments, attachmentToRemove)
    expect(result).toEqual(attachments)
  })
})
