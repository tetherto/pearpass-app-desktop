import { useEffect, useRef } from 'react'

import { MS_PER_MINUTE } from 'pearpass-lib-constants'
import { closeAllInstances, useUserData, useVaults } from 'pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { logger } from '../../../utils/logger'

/**
 * @param {Object} options - Configuration options for inactivity detection.
 * @param {number} [options.timeoutMs=60000] - Timeout duration in milliseconds before triggering inactivity actions.
 * @returns {void}
 */
export function useInactivity({ timeoutMs = 5 * MS_PER_MINUTE } = {}) {
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

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer)
    )

    // Listen for IPC activity events
    window.addEventListener('ipc-activity', handleIPCActivity)
    resetTimer()

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      )
      window.removeEventListener('ipc-activity', handleIPCActivity)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
