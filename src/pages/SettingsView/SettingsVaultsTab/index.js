import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useVaults } from 'pearpass-lib-vault'

import { Content } from './styles'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { ListItem } from '../../../components/ListItem'
import { ModifyVaultModalContent } from '../../../containers/Modal/ModifyVaultModalContent'
import { useModal } from '../../../context/ModalContext'
import { vaultCreatedFormat } from '../../../utils/vaultCreated'

export const SettingsVaultsTab = () => {
  const { i18n } = useLingui()
  const { data } = useVaults()
  const { setModal } = useModal()

  return html`
    <${CardSingleSetting} title=${i18n._('Manage Vaults')}>
      <${Content}>
        ${data?.map(
          (vault) =>
            html`<${ListItem}
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
            />`
        )}
      <//>
    <//>
  `
}
