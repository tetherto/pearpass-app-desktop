import { useState, useCallback } from 'react'

import { html } from 'htm/react'

import { usePearUpdate } from '../../hooks/usePearUpdate'
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading'
import { Routes } from '../Routes'
import { useInactivity } from './hooks/useInactivity'
import { useOnExtensionExit } from './hooks/useOnExtensionExit'
import { useOnExtensionLockOut } from './hooks/useOnExtensionLockOut'
import { useRedirect } from './hooks/useRedirect'

export const App = () => {
  usePearUpdate()
  const isSimulatedLoading = useSimulatedLoading()
  const [isLoadingPageComplete, setIsLoadingPageComplete] = useState(false)

  useInactivity()
  const { isLoading: isDataLoading } = useRedirect()

  useOnExtensionExit()
  useOnExtensionLockOut()

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingPageComplete(true)
  }, [])

  // Show LoadingPage during data loading and until the loading animation completes
  const showLoadingPage =
    !isSimulatedLoading && (isDataLoading || !isLoadingPageComplete)

  return html`
    <${Routes}
      isSplashScreenShown=${isSimulatedLoading}
      isDataLoading=${showLoadingPage}
      onLoadingComplete=${handleLoadingComplete}
    />
  `
}
