import { parseOtpToJson } from '@tetherto/pearpass-lib-data-export'
import { encryptExportData } from '@tetherto/pearpass-lib-vault'

import { downloadFile } from './downloadFile'

export const handleExportOtpJson = async (data, encryptionPassword = null) => {
  const [file] = parseOtpToJson(data)
  if (!file) return

  const content = encryptionPassword
    ? JSON.stringify(
        await encryptExportData(file.data, encryptionPassword),
        null,
        2
      )
    : file.data

  downloadFile({ filename: file.filename, content }, 'json')
}
