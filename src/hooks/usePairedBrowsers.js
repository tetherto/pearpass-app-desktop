import { useCallback, useEffect, useState } from 'react'

import { PAIRED_BROWSERS_CHANGED_EVENT } from '../constants/pairing'
import { createOrGetPearpassClient } from '../services/createOrGetPearpassClient'
import { listClients } from '../services/security/pairedClients'
import { logger } from '../utils/logger'

/**
 * Browsers currently paired with this app.
 *
 * Pairing completes over native messaging, outside React, so the list also
 * refreshes whenever PAIRED_BROWSERS_CHANGED_EVENT fires.
 * @returns {{ browsers: Array<object>, isLoading: boolean, refresh: () => Promise<void> }}
 */
export const usePairedBrowsers = () => {
  const [browsers, setBrowsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const client = createOrGetPearpassClient()
      setBrowsers(await listClients(client))
    } catch (error) {
      logger.error(
        'PAIRED-BROWSERS',
        `Failed to load paired browsers: ${error.message}`
      )
      setBrowsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    window.addEventListener(PAIRED_BROWSERS_CHANGED_EVENT, refresh)
    return () =>
      window.removeEventListener(PAIRED_BROWSERS_CHANGED_EVENT, refresh)
  }, [refresh])

  return { browsers, isLoading, refresh }
}
