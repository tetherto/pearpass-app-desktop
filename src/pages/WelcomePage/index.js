import React from 'react'

import { CardCreateMasterPassword } from './CardCreateMasterPassword'
import { CardUnlockPearPass } from './CardUnlockPearPass'
import { LockedScreen } from './LockedScreen/LockedScreen'
import { NAVIGATION_ROUTES } from '../../constants/navigation'
import { useRouter } from '../../context/RouterContext'

export const WelcomePage = () => {
  const { data } = useRouter()

  const Card = React.useMemo(() => {
    switch (data.state) {
      case NAVIGATION_ROUTES.CREATE_MASTER_PASSWORD:
        return CardCreateMasterPassword
      case NAVIGATION_ROUTES.MASTER_PASSWORD:
        return CardUnlockPearPass
      case NAVIGATION_ROUTES.SCREEN_LOCKED:
        return LockedScreen
      default:
        return null
    }
  }, [data.state])

  if (!Card) return null

  return <Card />
}
