export const downloadFile = ({ filename, content }, type) => {
  const blob = new Blob([content], {
    type: type === 'json' ? 'application/json' : 'text/csv;charset=utf-8;'
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
