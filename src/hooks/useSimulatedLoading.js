import { useState, useEffect } from 'react'

/**
 * @param {number} duration
 * @returns {boolean}
 */
export const useSimulatedLoading = (duration = 2000) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return loading
}
