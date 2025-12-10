/**
 * @param {Array} data
 * @returns {Array<{filename: string, data: string}>}
 */
export const parseDataToJson = (data) =>
  data.map((vault) => {
    const records = vault.records
      .map((record) => ({
        ...record,
        vaultName: vault.name
      }))
      .filter((r) => !!r.type)

    const json = JSON.stringify(records, null, 2)

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_')
    const safeVaultName = vault.name.replace(/[^a-z0-9]/gi, '_')

    const filename = `PearPass_${safeVaultName}_${timestamp}.json`

    return {
      filename,
      data: json
    }
  })
