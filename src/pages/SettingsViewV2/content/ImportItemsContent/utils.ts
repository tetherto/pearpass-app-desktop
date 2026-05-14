export const detectIsEncrypted = (
  fileType: string,
  fileContent: string | ArrayBuffer
): boolean => {
  if (fileType !== 'json') return false

  try {
    const parsed = JSON.parse(fileContent as string)
    return parsed?.encrypted === true
  } catch {
    return false
  }
}
