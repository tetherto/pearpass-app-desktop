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

  useInactivity()
  const { isLoading } = useRedirect()

  useOnExtensionExit()
  useOnExtensionLockOut()

  return html` <${Routes} isLoading=${isLoading || isSimulatedLoading} /> `
}
