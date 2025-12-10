import { useEffect } from 'react'

import { useVaults } from 'pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { HANDLER_EVENTS } from '../../../constants/services'
import { useRouter } from '../../../context/RouterContext'

export const useOnExtensionExit = () => {
  const { navigate } = useRouter()
  const { resetState } = useVaults()

  useEffect(() => {
    const handleExtensionExit = () => {
      navigate('welcome', { state: NAVIGATION_ROUTES.MASTER_PASSWORD })
      resetState()
    }

    window.addEventListener(HANDLER_EVENTS.extensionExit, handleExtensionExit)
    return () => {
      window.removeEventListener(
        HANDLER_EVENTS.extensionExit,
        handleExtensionExit
      )
    }
  }, [navigate])
}
