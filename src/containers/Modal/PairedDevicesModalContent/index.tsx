import React, { useEffect, useMemo, useState } from 'react'

import { formatDate } from '@tetherto/pear-apps-utils-date'
import {
  Button,
  ContextMenu,
  Dialog,
  ListItem,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Devices,
  DoNotDisturb,
  LaptopMac,
  LaptopWindows,
  MoreVert,
  PhoneIphone,
  Tablet
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { getMyDeviceId, useVault } from '@tetherto/pearpass-lib-vault'

import { createStyles, DEVICE_ACTIONS_MENU_WIDTH } from './styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { logger } from '../../../utils/logger'
import { RevokeAccessModalContentV2 } from '../RevokeAccessModalContentV2'

const getDeviceDisplayName = (
  deviceName: string | undefined,
  t: (value: string) => string
): string => {
  if (!deviceName) return t('Unknown Device')

  const lowerName = deviceName.toLowerCase()

  if (lowerName.startsWith('ios')) return t('iPhone')
  if (lowerName.startsWith('android')) return t('Android')

  return deviceName
}

const getDeviceIcon = (deviceName?: string) => {
  if (!deviceName) return Devices

  const lowerName = deviceName.toLowerCase()

  if (lowerName.startsWith('ios') || lowerName.includes('iphone'))
    return PhoneIphone
  if (lowerName.startsWith('android')) return PhoneIphone
  if (lowerName.includes('ipad') || lowerName.includes('tablet')) return Tablet
  if (
    lowerName.includes('mac') ||
    lowerName.includes('imac') ||
    lowerName.includes('darwin') ||
    lowerName.includes('macbook')
  )
    return LaptopMac
  if (lowerName.includes('windows')) return LaptopWindows

  return Devices
}

type Device = {
  id?: string
  name?: string
  createdAt?: string | number | Date
}

export const PairedDevicesModalContent = () => {
  const { t } = useTranslation()
  const { closeModal, setModal } = useModal()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const { data: vaultData } = useVault()
  const vaultId = (vaultData as { id?: string } | undefined)?.id ?? ''

  const devices = useMemo<Device[]>(
    () =>
      Array.isArray(vaultData?.devices) ? (vaultData.devices as Device[]) : [],
    [vaultData]
  )

  const [myDeviceId, setMyDeviceId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMyDeviceId()
      .then((id: string | null) => {
        if (!cancelled) setMyDeviceId(id ?? null)
      })
      .catch((error: unknown) => {
        logger.error('PairedDevicesModalContent', 'getMyDeviceId failed:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const openRevokeModal = (device: Device, displayName: string) => {
    if (!device.id || !vaultId) return
    setModal(
      <RevokeAccessModalContentV2
        vaultId={vaultId}
        targetDeviceId={device.id}
        deviceName={displayName}
      />
    )
  }

  return (
    <Dialog
      title={t('Paired Devices')}
      onClose={closeModal}
      testID="see-devices-dialog"
      closeButtonTestID="see-devices-close"
      footer={
        <Button
          size="small"
          type="button"
          onClick={closeModal}
          data-testid="see-devices-close-button"
        >
          {t('Understood')}
        </Button>
      }
    >
      {devices.length === 0 ? (
        <div style={styles.emptyState}>
          <Text as="p" variant="body" color={theme.colors.colorTextSecondary}>
            {t('No devices synced yet')}
          </Text>
        </div>
      ) : (
        <div style={styles.list}>
          {devices.map((device, index) => {
            const deviceName = getDeviceDisplayName(device.name, t)
            const DeviceIcon = getDeviceIcon(device.name)
            const createdAt = device.createdAt
              ? formatDate(new Date(device.createdAt), 'dd-mmm-yyyy', ' ')
              : null
            const isCurrentDevice = !!myDeviceId && device.id === myDeviceId

            return (
              <ListItem
                key={device.id ?? `${deviceName}-${index}`}
                icon={
                  <div style={styles.iconWrap}>
                    <DeviceIcon
                      width={16}
                      height={16}
                      color={theme.colors.colorAccentActive}
                    />
                  </div>
                }
                title={deviceName}
                subtitle={
                  createdAt ? `${t('Paired on')} ${createdAt}` : undefined
                }
                testID={`see-devices-item-${device.id ?? index}`}
                rightElement={
                  isCurrentDevice || !device.id ? undefined : (
                    <ContextMenu
                      menuWidth={DEVICE_ACTIONS_MENU_WIDTH}
                      testID={`see-devices-row-menu-${device.id}`}
                      trigger={
                        <Button
                          variant="tertiary"
                          size="small"
                          aria-label={t('Device actions')}
                          iconBefore={
                            <MoreVert
                              width={16}
                              height={16}
                              color={theme.colors.colorTextPrimary}
                            />
                          }
                        />
                      }
                    >
                      <NavbarListItem
                        size="small"
                        variant="destructive"
                        icon={
                          <DoNotDisturb
                            color={theme.colors.colorSurfaceDestructiveElevated}
                          />
                        }
                        label={t('Revoke Access')}
                        testID={`see-devices-row-revoke-${device.id}`}
                        onClick={() => openRevokeModal(device, deviceName)}
                      />
                    </ContextMenu>
                  )
                }
              />
            )
          })}
        </div>
      )}
    </Dialog>
  )
}
