import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { Content } from './styles'
import { CardSingleSetting } from '../../../../components/CardSingleSetting'
import { ListItem } from '../../../../components/ListItem'
import { ModifyMasterVaultModalContent } from '../../../../containers/Modal/ModifyMasterVaultModalContent'
import { useModal } from '../../../../context/ModalContext'

export const SettingsPasswordsSection = () => {
  const { i18n } = useLingui()
  const { setModal } = useModal()

  return html`
    <${CardSingleSetting}
      testId="settings-card-master-password"
      title=${i18n._('Master Password')}
      description=${i18n._('Manage the password that protects your app.')}
    >
      <${Content}>
        <${ListItem}
          itemName=${i18n._('Master Vault')}
          editTestId="settings-master-vault-edit-button"
          onEditClick=${() =>
            setModal(html`<${ModifyMasterVaultModalContent} />`)}
        />
      <//>
    <//>
  `
}
