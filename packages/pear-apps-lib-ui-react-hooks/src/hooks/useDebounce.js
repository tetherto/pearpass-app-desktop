import { useState, useEffect } from 'react'

/**
 * @typedef useDebounceProps
 * @param {{ value: any, delay: number }} params
 * @returns {{ debouncedValue: any, debounce: (callback: () => void) => void }}
 */
export const useDebounce = ({ value, delay = 200 } = {}) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  const debounce = (callback) => {
    const timeout = setTimeout(() => {
      callback()
    }, delay)

    return () => clearTimeout(timeout)
  }

  useEffect(() => {
    debounce(() => setDebouncedValue(value))
  }, [value, delay])

  return { debouncedValue, debounce }
}
