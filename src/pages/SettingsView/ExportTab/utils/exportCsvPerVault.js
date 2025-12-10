import { parseDataToCsvText } from 'pearpass-lib-data-export'

import { downloadFile } from './downloadFile'
import { downloadZip } from './downloadZip'

export const handleExportCSVPerVault = async (data) => {
  const vaultsToExport = await parseDataToCsvText(data)

  if (vaultsToExport.length === 1) {
    downloadFile(
      {
        filename: vaultsToExport[0].filename,
        content: vaultsToExport[0].data
      },
      'csv'
    )
  } else if (vaultsToExport.length > 1) {
    await downloadZip(vaultsToExport)
  }
}
