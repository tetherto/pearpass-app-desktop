import React from 'react'

import { html } from 'htm/react'

import { CardCreateMasterPassword } from './CardCreateMasterPassword'
import { CardCreateMasterPasswordV2 } from './CardCreateMasterPasswordV2'
import { CardLoadVault } from './CardLoadVault'
import { CardNewVaultCredentials } from './CardNewVaultCredentials'
import { CardUnlockPearPass } from './CardUnlockPearPass'
import { CardUnlockPearPassV2 } from './CardUnlockPearPassV2'
import { CardUnlockVault } from './CardUnlockVault'
import { CardUploadBackupFile } from './CardUploadBackupFile'
import { CardVaultSelect } from './CardVaultSelect'
import { LockedScreen } from './LockedScreen'
import { CardVaultActions, PageContainer } from './styles'
import { InitialPageWrapper } from '../../components/InitialPageWrapper'
import { NAVIGATION_ROUTES } from '../../constants/navigation'
import { useRouter } from '../../context/RouterContext'
import { isV2 } from '../../utils/designVersion'

const V2_STATES = new Set([
  NAVIGATION_ROUTES.CREATE_MASTER_PASSWORD,
  NAVIGATION_ROUTES.MASTER_PASSWORD
])

export const WelcomePage = () => {
  const { data } = useRouter()

  const Card = React.useMemo(() => {
    switch (data.state) {
      case NAVIGATION_ROUTES.CREATE_MASTER_PASSWORD:
        return isV2() ? CardCreateMasterPasswordV2 : CardCreateMasterPassword
      case NAVIGATION_ROUTES.MASTER_PASSWORD:
        return isV2() ? CardUnlockPearPassV2 : CardUnlockPearPass
      case NAVIGATION_ROUTES.VAULTS:
        return CardVaultSelect
      case NAVIGATION_ROUTES.LOAD_VAULT:
        return CardLoadVault
      case NAVIGATION_ROUTES.UPLOAD_BACKUP_FILE:
        return CardUploadBackupFile
      case NAVIGATION_ROUTES.VAULT_PASSWORD:
        return CardUnlockVault
      case NAVIGATION_ROUTES.NEW_VAULT_CREDENTIALS:
        return CardNewVaultCredentials
      case NAVIGATION_ROUTES.SCREEN_LOCKED:
        return LockedScreen
      default:
        return null
    }
  }, [data.state])

  if (isV2() && V2_STATES.has(data.state)) {
    return html`<${Card} />`
  }

  return html`
    <${InitialPageWrapper} isAuthScreen=${true}>
      <${PageContainer}>
        <${CardVaultActions}>
          <${Card} />
        <//>
      <//>
    <//>
  `
}
