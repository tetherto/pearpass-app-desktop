import { useState, useEffect } from 'react'
import { createOrGetPearpassClient } from '../services/createOrGetPearpassClient'

interface UseFaviconReturn {
  faviconSrc: string | null
  isLoading: boolean
  hasError: boolean
}

export const useFavicon = (params: { url: string }): UseFaviconReturn => {
  const { url } = params
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    if (!url) {
      setFaviconSrc(null)
      setIsLoading(false)
      setHasError(false)
      return
    }

    setIsLoading(true)
    setHasError(false)

    const fetchFavicon = async () => {
      try {
        const client = createOrGetPearpassClient()
        if (!client) {
          setFaviconSrc(null)
          setHasError(true)
          setIsLoading(false)
          return
        }

        const res = await client.fetchFavicon(url) as unknown as {
          received: boolean, url: string, favicon: string | null
        }

        console.log('UI received IPC response:', res)

        if (res && res.received && res.favicon) {
          setFaviconSrc(res.favicon)
          setHasError(false)
        } else {
          setFaviconSrc(null)
          setHasError(true)
        }
        setIsLoading(false)
      } catch (err) {
        console.warn('IPC Favicon Fetch failed:', err)
        setFaviconSrc(null)
        setHasError(true)
        setIsLoading(false)
      }
    }

    fetchFavicon()
  }, [url])

  return { faviconSrc, isLoading, hasError }
}
