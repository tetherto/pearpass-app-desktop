import { parseOtpToQrSvgs } from '@tetherto/pearpass-lib-data-export'

import { downloadZip } from './downloadZip'

export const handleExportOtpQrZip = async (data) => {
  const files = await parseOtpToQrSvgs(data)
  if (!files?.length) return

  await downloadZip(files)
}
