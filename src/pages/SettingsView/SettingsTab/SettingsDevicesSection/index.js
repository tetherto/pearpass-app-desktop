import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { formatDate } from 'pear-apps-utils-date'
import { useVault } from 'pearpass-lib-vault'

import { Description, content } from './styles'
import { CardSingleSetting } from '../../../../components/CardSingleSetting'
import { ListItem } from '../../../../components/ListItem'
import { AddDeviceModalContent } from '../../../../containers/Modal/AddDeviceModalContent'
import { useModal } from '../../../../context/ModalContext'
import { ButtonPrimary } from '../../../../lib-react-components'

/**
 * @param {{}} props
 */
export const SettingsDevicesSection = () => {
  const { i18n } = useLingui()
  const { data } = useVault()
  const { setModal } = useModal()

  const handleAddDevice = () => {
    setModal(html`<${AddDeviceModalContent} />`)
  }

  return html`
    <${CardSingleSetting} title=${i18n._('Linked devices')}>
      <${content}>
        <${Description}
          >${i18n._('These are the devices with access to this Vault.')}
        <//>
        ${data?.devices?.map(
          (device) =>
            html`<${ListItem}
              key=${device.name}
              itemName=${device.name}
              itemDateText=${i18n._('Added on') +
              ' ' +
              formatDate(device.createdAt, 'dd-mm-yyyy', '/')}
            />`
        )}
        <div style=${{ display: 'flex', justifyContent: 'center' }}>
          <${ButtonPrimary} onClick=${handleAddDevice} width="fit-content">
            ${i18n._('Connect a new device')}
          <//>
        </div>
      <//>
    <//>
  `
}
