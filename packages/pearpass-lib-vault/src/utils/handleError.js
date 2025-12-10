export const handleErrorIfExists = (
  error,
  cb,
  defaultMessage = 'An unexpected error has occurred'
) => {
  if (error) {
    const errorMessage = error?.message || defaultMessage
    const recordError = new Error(errorMessage)
    cb?.(recordError)
    throw recordError
  }
}
