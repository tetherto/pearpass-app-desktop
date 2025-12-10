import { updateFolderFactory } from './updateFolderFactory'

describe('updateFolderFactory', () => {
  const mockVault = {
    data: {
      records: [
        { id: '1', type: 'note', folder: 'old', data: {} },
        { id: '2', type: 'login', folder: null, data: {} },
        { id: '3', type: 'card', folder: 'old', data: {} }
      ]
    }
  }

  it('should throw an error if recordIds is not an array', () => {
    expect(() =>
      updateFolderFactory('not-an-array', 'new-folder', mockVault)
    ).toThrow('Record IDs must be an array')
  })

  it('should throw an error if folder is empty', () => {
    expect(() => updateFolderFactory(['1', '2'], '', mockVault)).toThrow(
      'Folder name is required'
    )
  })

  it('should throw an error if vault data is invalid', () => {
    expect(() =>
      updateFolderFactory(['1', '2'], 'new-folder', { data: null })
    ).toThrow('Invalid vault data')
  })

  it('should update the folder of the specified records', () => {
    const updated = updateFolderFactory(['1', '3'], 'new-folder', mockVault)

    expect(updated).toEqual([
      { id: '1', type: 'note', folder: 'new-folder', data: {} },
      { id: '3', type: 'card', folder: 'new-folder', data: {} }
    ])
  })

  it('should skip recordIds that are not found', () => {
    const updated = updateFolderFactory(['1', '999'], 'new-folder', mockVault)

    expect(updated).toEqual([
      { id: '1', type: 'note', folder: 'new-folder', data: {} }
    ])
  })
})
