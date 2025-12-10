import { pearpassVaultClient } from '../instances'

/**
 * @param {{recordId: string, fileId: string}[]} files
 */
export const vaultRemoveFiles = async (files) => {
  if (!files?.length) {
    throw new Error('File keys are required')
  }

  await Promise.all(
    files.map(({ recordId, fileId }) =>
      pearpassVaultClient.activeVaultRemoveFile(
        `record/${recordId}/file/${fileId}`
      )
    )
  )
}
