import JSZip from 'jszip'

export const downloadZip = async (files) => {
  const zip = new JSZip()
  files.forEach(({ filename, data }) => {
    zip.file(filename, data)
  })
  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(content)
  link.download = `PearPass_Export_${new Date().toISOString().replace(/[:.-]/g, '_')}.zip`
  link.click()
  URL.revokeObjectURL(link.href)
}
