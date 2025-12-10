import { useEffect, useState } from 'react'

import { useUserData } from 'pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useRouter } from '../../../context/RouterContext'
import { logger } from '../../../utils/logger'

/**
 * @returns {Object} An object containing:
 * @property {boolean} isLoading - Indicates if the user data is currently loading.
 */
export const useRedirect = () => {
  const [isLoading, setIsLoading] = useState(true)

  const { navigate } = useRouter()

  const { refetch: refetchUser } = useUserData()

  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const userData = await refetchUser()

        if (userData?.masterPasswordStatus?.isLocked) {
          navigate('welcome', {
            state: NAVIGATION_ROUTES.SCREEN_LOCKED
          })
          return
        }

        if (!userData?.hasPasswordSet) {
          navigate('intro')
          return
        }

        navigate('welcome', {
          state: userData?.hasPasswordSet
            ? NAVIGATION_ROUTES.MASTER_PASSWORD
            : NAVIGATION_ROUTES.CREATE_MASTER_PASSWORD
        })
      } catch (error) {
        logger.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  return {
    isLoading
  }
}
