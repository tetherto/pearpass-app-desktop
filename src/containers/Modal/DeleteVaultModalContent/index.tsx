import { useEffect, useMemo, useState } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import {
  authoriseCurrentProtectedVault,
  useUserData,
  useVault
} from 'pearpass-lib-vault'

import { DeviceList } from './DeviceList'
import {
  Content,
  DeleteVaultButton,
  InputWrapper,
  ModalActions,
  ModalTitle,
  ModalHeaderWrapper,
  Wrapper,
  ModalDescription
} from './styles'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  ButtonPrimary,
  ButtonSecondary,
  DeleteIcon,
  PearPassPasswordFieldV2
} from '../../../lib-react-components'
import { getDeviceName } from '../../../utils/getDeviceName'
import { logger } from '../../../utils/logger'
import { ModalContent } from '../ModalContent'
import { clearBuffer, stringToBuffer } from 'pearpass-lib-vault/src/utils/buffer'
import {PROTECTED_VAULT_ENABLED} from 'pearpass-lib-constants'
import { FlowType, Device, DeleteVaultModalContentProps } from './types'

export const DeleteVaultModalContent = ({
  vaultId,
  flowType = FlowType.DELETE
}: DeleteVaultModalContentProps) => {
  const isKickOutFlow = flowType === FlowType.KICK_OUT
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()
  const [isProtected, setIsProtected] = useState(false || PROTECTED_VAULT_ENABLED)
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false)
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const {
    data: vaultData,
    refetch: refetchVault,
    isVaultProtected
  } = useVault()
  const { logIn } = useUserData()
  
  useEffect(() => {
    if (PROTECTED_VAULT_ENABLED) {
    const checkProtection = async () => {
      const isProtectedVault = await isVaultProtected(vaultId)
      setIsProtected(isProtectedVault)
    }
    checkProtection()
   }
  }, [vaultId, PROTECTED_VAULT_ENABLED])

  const currentDeviceName = useMemo(() => getDeviceName(), [])
  const devices = (vaultData as Record<string, unknown> | undefined)?.devices

  const baseDevices = useMemo<Device[]>(
    () =>
      devices && Array.isArray(devices)
        ? (devices as Device[])
        : [],
    [devices]
  )

  const devicesWithCurrent = useMemo<Device[]>(() => {
    const existingCurrent = baseDevices.find(
      (d) => d?.name === currentDeviceName
    )

    if (existingCurrent) {
      // Ensure current device is always shown first in the list.
      return [
        existingCurrent,
        ...baseDevices.filter((device) => device.id !== existingCurrent.id)
      ]
    }

    // Current device is not listed in vault devices - prepend manually.
    const currentDevice = {
      id: 'current-device',
      name: currentDeviceName,
      createdAt: Date.now(),
      vaultId: vaultId ?? vaultData?.id ?? '',
    }

    return [currentDevice, ...baseDevices]
  }, [baseDevices, currentDeviceName, vaultData?.id, vaultId])

  const currentDeviceId = useMemo<string>(() => {
    const existingCurrent = baseDevices.find(
      (d) => d?.name === currentDeviceName
    )
    return existingCurrent?.id ?? 'current-device'
  }, [baseDevices, currentDeviceName])

  const getSchema = () =>
    Validator.object({
      masterPassword: isConfirmStep
        ? Validator.string().required(t('Master password is required'))
        : Validator.string(),
      vaultPassword:
        isConfirmStep && isProtected
          ? Validator.string().required(t('Vault password is required'))
          : Validator.string()
    })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: { masterPassword: '', vaultPassword: '' },
    validate: (values: { masterPassword: string; vaultPassword: string }) =>
      getSchema().validate(values)
  })

  const masterPasswordField = register('masterPassword')
  const vaultPasswordField = register('vaultPassword')

  useEffect(() => {
    if (currentDeviceId && !selectedDeviceIds.includes(currentDeviceId)) {
      setSelectedDeviceIds((prev) =>
        prev.length ? [currentDeviceId, ...prev] : [currentDeviceId]
      )
    }
  }, [currentDeviceId, selectedDeviceIds])

  const handleOptionChange = (nextSelection: string[]) => {
    setSelectedDeviceIds(nextSelection)
  }

  const handleContinue = handleSubmit(() => {
    setIsConfirmStep(true)
  })

  const onSubmit = async (values: {
    masterPassword: string
    vaultPassword: string
  }) => {
    if (!values.masterPassword) {
      setErrors({
        masterPassword: t('Master password is required')
      })
      return
    }

    const passwordBuffer = stringToBuffer(values.masterPassword)
    setIsLoading(true)

    try {
      await (logIn as unknown as (params: { password: Buffer<ArrayBufferLike> }) => Promise<void>)({
        password: passwordBuffer
      })
    } catch (error) {
      setErrors({
        masterPassword: t('Invalid master password')
      })
      logger.error('DeleteVaultModalContent', 'Error validating master password:', error)
      clearBuffer(passwordBuffer)
      setIsLoading(false)
      return
    }

    clearBuffer(passwordBuffer)

    if (isProtected) {
      if (!values.vaultPassword) {
        setErrors({
          vaultPassword: t('Vault password is required')
        })
        setIsLoading(false)
        return
      }

      try {
        await authoriseCurrentProtectedVault(values.vaultPassword)
      } catch (error) {
        setErrors({
          vaultPassword: t('Invalid vault password')
        })
        logger.error(
          'DeleteVaultModalContent',
          'Error validating vault password:',
          error
        )
        setIsLoading(false)
        return
      }
    }
    // 3. TODO: implement delete / kick-off logic here using selectedDeviceIds.
    setIsLoading(false)
    // closeModal()
  }

  useEffect(() => {
    refetchVault()
  }, [])

  return html` <${ModalContent}
    onClose=${closeModal}
    headerChildren=${html`
      <${ModalHeaderWrapper}>
        <${ModalTitle}>
          ${isKickOutFlow
            ? ''
            : t('Are you sure you want to delete this vault?')}
        <//>
        <${ModalDescription}>
          ${isKickOutFlow
            ? ''
            : isConfirmStep
              ? html`
                  ${t(
                    'Confirm with your passwords to permanently delete this vault from the devices below.'
                  )}
                `
              : html`
                  ${t('This will permanently delete all items in this vault. ')}
                  <br />
                  ${t('This action cannot be undone.')}
                `}
        <//>
      <//>
    `}
  >
    <${Wrapper}>
      <${Content}>
        ${!isConfirmStep
          ? html`
              <${ModalDescription} marginBottom=${15}>
                ${isKickOutFlow
                  ? ''
                  : t('Select additional devices to delete the vault from')}
              <//>
              <${DeviceList}
                devices=${devicesWithCurrent}
                value=${selectedDeviceIds}
                currentDeviceId=${currentDeviceId}
                onChange=${handleOptionChange}
              />
            `
          : html`
              <${DeviceList}
                devices=${devicesWithCurrent.filter((d) =>
                  selectedDeviceIds.includes(d.id)
                )}
                value=${selectedDeviceIds}
                readOnly=${true}
                currentDeviceId=${currentDeviceId}
              />

              <${InputWrapper}>
                <${PearPassPasswordFieldV2}
                  placeholder=${t('Insert master password')}
                  isDisabled=${false}
                  ...${masterPasswordField}
                />
                ${isProtected &&
                html`
                  <${PearPassPasswordFieldV2}
                    placeholder=${t('Insert vault password')}
                    isDisabled=${false}
                    ...${vaultPasswordField}
                  />
                `}
              <//>
            `}

        <${ModalActions}>
          ${!isConfirmStep
            ? html`
                <${ButtonPrimary} onClick=${handleContinue}>
                  ${t('Continue')}
                <//>
                <${ButtonSecondary} onClick=${closeModal}> ${t('Cancel')} <//>
              `
            : html`
                <${DeleteVaultButton} onClick=${handleSubmit(onSubmit)}>
                  <${DeleteIcon} size="20" /> ${isKickOutFlow
                    ? t('')
                    : t('Delete vault')}
                <//>
                <${ButtonSecondary} onClick=${() => setIsConfirmStep(false)}>
                  ${t('Back')}
                <//>
              `}
        <//>
      <//>
    <//>
  <//>`
}
