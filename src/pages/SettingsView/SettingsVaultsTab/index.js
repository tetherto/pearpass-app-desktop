import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { DELETE_VAULT_ENABLED } from 'pearpass-lib-constants'
import { useVault } from 'pearpass-lib-vault'

import { Content } from './styles'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { ListItem } from '../../../components/ListItem'
import { DeleteVaultModalContent } from '../../../containers/Modal/DeleteVaultModalContent'
import { ModifyVaultModalContent } from '../../../containers/Modal/ModifyVaultModalContent'
import { useModal } from '../../../context/ModalContext'
import { vaultCreatedFormat } from '../../../utils/vaultCreated'

export const SettingsVaultsTab = () => {
  const { i18n } = useLingui()
  const { data: vault } = useVault()
  const { setModal } = useModal()

  return html`
    <${CardSingleSetting}
      title=${i18n._('Your Vault')}
      description=${i18n._('Share, edit, or delete your vault from one place.')}
    >
      <${Content}>
        <${ListItem}
          key=${vault.name}
          itemName="${vault.name}"
          itemDateText=${vaultCreatedFormat(vault.createdAt)}
          onEditClick=${() =>
            setModal(
              html`<${ModifyVaultModalContent}
                vaultId=${vault.id}
                vaultName=${vault.name}
              />`
            )}
          onDeleteClick=${DELETE_VAULT_ENABLED &&
          (() =>
            setModal(
              html`<${DeleteVaultModalContent}
                vaultId=${vault.id}
                vaultName=${vault.name}
              />`
            ))}
        />
      <//>
    <//>
  `
}
