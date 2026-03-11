import { parseDataToJson } from 'pearpass-lib-data-export'
import { encryptExportData } from 'pearpass-lib-vault'

import { downloadFile } from './downloadFile'
import { downloadZip } from './downloadZip'

export const handleExportJsonPerVaultTest = async (
  data,
  encryptionPassword = null
) => {
  const vaultsToExport = await parseDataToJson(data)

  const processedVaults = encryptionPassword
    ? await Promise.all(
        vaultsToExport.map(async (vault) => {
          const encryptedData = await encryptExportData(
            vault.data,
            encryptionPassword
          )
          return {
            filename: vault.filename.replace('.json', '.pearpass'),
            data: JSON.stringify(encryptedData, null, 2)
          }
        })
      )
    : vaultsToExport

  if (processedVaults.length === 1) {
    downloadFile(
      {
        filename: processedVaults[0].filename,
        content: processedVaults[0].data
      },
      encryptionPassword ? 'pearpass' : 'json'
    )
  } else if (processedVaults.length > 1) {
    await downloadZip(processedVaults)
  }
}
