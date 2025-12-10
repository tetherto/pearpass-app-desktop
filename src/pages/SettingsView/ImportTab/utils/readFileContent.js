/**
 *
 * @param {File} file
 * @param {Object} [options]
 * @param {'text'|'buffer'} [options.as='text']
 * @returns {Promise<string|ArrayBuffer>}
 */
export const readFileContent = (file, { as = 'text' } = {}) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    if (as === 'buffer') {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  })
