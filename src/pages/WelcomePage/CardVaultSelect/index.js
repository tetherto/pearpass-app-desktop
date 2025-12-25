import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useVault, useVaults } from 'pearpass-lib-vault'

import {
  ButtonWrapper,
  CardContainer,
  CardNoVaultsText,
  CardTitle,
  ImportContainer,
  ImportText,
  Title,
  VaultsContainer
} from './styles'
import { ListItem } from '../../../components/ListItem'
import { useRouter } from '../../../context/RouterContext'
import {
  ButtonPrimary,
  ButtonSecondary,
  CommonFileIcon
} from '../../../lib-react-components'
import { vaultCreatedFormat } from '../../../utils/vaultCreated'

export const CardVaultSelect = () => {
  const { i18n } = useLingui()
  const { currentPage, navigate } = useRouter()

  const { data } = useVaults()

  const { isVaultProtected, refetch: refetchVault } = useVault()

  const handleLoadVault = () => {
    navigate(currentPage, { state: 'loadVault' })
  }

  const handleSelectVault = async (vaultId) => {
    const isProtected = await isVaultProtected(vaultId)

    if (isProtected) {
      navigate(currentPage, { state: 'vaultPassword', vaultId: vaultId })

      return
    }

    await refetchVault(vaultId)

    navigate('vault', { recordType: 'all' })
  }

  const handleCreateNewVault = () => {
    navigate(currentPage, { state: 'newVaultCredentials' })
  }

  const handleUploadBackupFile = () => {
    navigate(currentPage, { state: 'uploadBackupFile' })
  }

  const hasVaults = data && data.length > 0

  return html`
    <${CardContainer}>
      <${CardTitle}>
        <${Title} data-testid="vault-title">
          ${data.length > 0
            ? i18n._('Select a vault, create a new one or load another one')
            : i18n._('Create or Load Vault')}
        <//>
      <//>

      ${hasVaults
        ? html` <${VaultsContainer}>
            ${data.map(
              (vault) =>
                html`<${ListItem}
                  onClick=${() => handleSelectVault(vault.id)}
                  itemName=${vault.name}
                  itemDateText=${vaultCreatedFormat(vault.createdAt)}
                  testId=${`vault-item-${vault.name}`}
                />`
            )}
          <//>`
        : html`<${CardNoVaultsText}>
            ${i18n._(
              'Now create a secure vault or load an existing one to get started.'
            )}
          <//> `}

      <${ButtonWrapper}>
        <${ButtonPrimary}
          testId="vault-create-button"
          onClick=${handleCreateNewVault}
        >
          ${i18n._('Create a new vault')}
        <//>

        <${ButtonSecondary}
          testId="vault-load-button"
          onClick=${handleLoadVault}
        >
          ${i18n._('Load a vault')}
        <//>
      <//>

      <!-- Will be visible when the feature is added-->
      <!-- ${!hasVaults &&
      html`
        <${ImportContainer}>
          ${i18n._('Or')}
          <${CommonFileIcon} size="21" color=${colors.primary400.mode1} />
          <${ImportText} onClick=${handleUploadBackupFile}>
            ${i18n._('import from a backup file')}
          <//>
        <//>
      `} -->
    <//>
  `
}
