export const downloadFile = ({ filename, content }, type) => {
  const mimeTypes = {
    json: 'application/json',
    csv: 'text/csv;charset=utf-8;',
    pearpass: 'application/json'
  }

  const blob = new Blob([content], {
    type: mimeTypes[type] || 'application/octet-stream'
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
