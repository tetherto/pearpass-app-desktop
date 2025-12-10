import { useEffect } from 'react'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { HANDLER_EVENTS } from '../../../constants/services'
import { useRouter } from '../../../context/RouterContext'

export const useOnExtensionLockOut = () => {
  const { navigate } = useRouter()

  useEffect(() => {
    const handleExtensionLockOut = () => {
      navigate('welcome', { state: NAVIGATION_ROUTES.SCREEN_LOCKED })
    }

    window.addEventListener(
      HANDLER_EVENTS.extensionLock,
      handleExtensionLockOut
    )

    return () => {
      window.removeEventListener(
        HANDLER_EVENTS.extensionLock,
        handleExtensionLockOut
      )
    }
  }, [navigate])
}
