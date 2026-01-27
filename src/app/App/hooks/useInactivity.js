import { useEffect, useRef } from 'react'

import { closeAllInstances, useUserData, useVaults } from 'pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { getAutoLockTimeoutMs } from '../../../hooks/useAutoLockPreferences'
import { logger } from '../../../utils/logger'

/**
 * @returns {void}
 */
export function useInactivity() {
  const { setIsLoading } = useLoadingContext()
  const { navigate } = useRouter()
  const { refetch: refetchUser } = useUserData()
  const { closeModal } = useModal()

  const { resetState } = useVaults()
  const timerRef = useRef(null)

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const timeoutMs = getAutoLockTimeoutMs()

    if (timeoutMs === null) {
      return
    }

    timerRef.current = setTimeout(async () => {
      const userData = await refetchUser()
      logger.info(
        'INACTIVITY-TIMER',
        `Inactivity timer triggered, user data: ${JSON.stringify(userData)}`
      )

      if (!userData.isLoggedIn) {
        return
      }

      setIsLoading(true)
      await closeAllInstances()
      closeModal()
      navigate('welcome', { state: NAVIGATION_ROUTES.MASTER_PASSWORD })
      resetState()
      setIsLoading(false)

      logger.info('INACTIVITY-TIMER', 'Inactivity timer reset')
    }, timeoutMs)
  }

  const activityEvents = [
    'mousemove',
    'keydown',
    'mousedown',
    'touchstart',
    'scroll'
  ]

  useEffect(() => {
    // Handler for IPC activity
    const handleIPCActivity = () => resetTimer()

    // Handler for settings changes - reset timer with new values
    const handleSettingsChange = () => resetTimer()

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer)
    )

    // Listen for IPC activity events
    window.addEventListener('ipc-activity', handleIPCActivity)

    // Listen for auto-lock settings changes
    window.addEventListener('auto-lock-settings-changed', handleSettingsChange)

    resetTimer()

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      )
      window.removeEventListener('ipc-activity', handleIPCActivity)
      window.removeEventListener(
        'auto-lock-settings-changed',
        handleSettingsChange
      )
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
