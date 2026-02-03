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
      title=${i18n._('Master Password')}
      description=${i18n._('Manage the password that protects your app.')}
    >
      <${Content}>
        <${ListItem}
          itemName=${i18n._('Master Vault')}
          onEditClick=${() =>
            setModal(html`<${ModifyMasterVaultModalContent} />`)}
        />
      <//>
    <//>
  `
}
