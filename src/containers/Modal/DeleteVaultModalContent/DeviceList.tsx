import React, { useMemo } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  CheckIcon,
  ComputerIcon,
  PhoneIcon
} from '../../../lib-react-components'
import { CheckIconWrapper, DeviceItem, DevicesList } from './styles'
import { useTranslation } from '../../../hooks/useTranslation'
import { Device } from './types'

export const DeviceList = ({
  devices = [],
  value,
  readOnly = false,
  onChange,
  currentDeviceId,
}: {
  devices: Device[]
  value: string[]
  readOnly?: boolean
  onChange?: (next: string[]) => void
  currentDeviceId?: string
}) => {
  const { t } = useTranslation()
  const selected = useMemo(() => new Set(value ?? []), [value])

  const toggle = (deviceKey: string) => {
    if (readOnly) {
      return
    }
    if (currentDeviceId && deviceKey === currentDeviceId) {
      return
    }

    const next = new Set(selected)
    if (next.has(deviceKey)) next.delete(deviceKey)
    else next.add(deviceKey)

    if (currentDeviceId) next.add(currentDeviceId)

    onChange?.(Array.from(next))
  }

  const renderDeviceIcon = (device: Device, isSelected: boolean, isCurrentDevice: boolean) => {
    // @TODO: there is no way to tell if the device is mobile, so we are hardcoding it to false for now.
    const isMobile = false;
    const BaseIcon = isMobile ? PhoneIcon : ComputerIcon

    if (readOnly) {
      return html`<${BaseIcon} width="20" height="20" />`
    }

    if (isCurrentDevice || isSelected) {
      const tickColor = isCurrentDevice
        ? colors.grey100.mode1
        : colors.black.mode1
      return html`
        <${CheckIconWrapper} $isCurrentDevice=${isCurrentDevice}>
          <${CheckIcon} size="20" color=${tickColor} />
        <//>
      `
    }

    return html`<${BaseIcon} width="20" height="20" />`
  }

  return html`
    <${DevicesList} role="list">
      ${devices.map((device) => {
        const { id, name } = device
        const isCurrentDevice = id === currentDeviceId
        const isSelected = selected.has(id) || isCurrentDevice
        const label = isCurrentDevice ? t('This device') : name

        return html`
          <${DeviceItem}
            key=${id}
            role="checkbox"
            aria-checked=${isSelected}
            aria-disabled=${readOnly || isCurrentDevice}
            isSelected=${isSelected}
            isDisabled=${readOnly || isCurrentDevice}
            onClick=${readOnly ? undefined : () => toggle(id)}
          >
            ${renderDeviceIcon(device, isSelected, isCurrentDevice)}
            <div>${label}</div>
          <//>
        `
      })}
    <//>
  `
}
