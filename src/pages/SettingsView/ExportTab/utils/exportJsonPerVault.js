import { parseDataToJson } from 'pearpass-lib-data-export'

import { downloadFile } from './downloadFile'
import { downloadZip } from './downloadZip'

export const handleExportJsonPerVaultTest = async (data) => {
  const vaultsToExport = await parseDataToJson(data)

  if (vaultsToExport.length === 1) {
    downloadFile(
      { filename: vaultsToExport[0].filename, content: vaultsToExport[0].data },
      'json'
    )
  } else if (vaultsToExport.length > 1) {
    await downloadZip(vaultsToExport)
  }
}
