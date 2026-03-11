import { useEffect, useState } from 'react'

import { html } from 'htm/react'
import {
  authoriseCurrentProtectedVault,
  getCurrentProtectedVaultEncryption,
  getMasterEncryption,
  getVaultById,
  listRecords,
  useVault
} from 'pearpass-lib-vault'

import { ActionsContainer, ContentContainer } from './styles'
import { handleExportCSVPerVault } from './utils/exportCsvPerVault'
import { handleExportJsonPerVaultTest } from './utils/exportJsonPerVault'
import { AlertBox } from '../../../components/AlertBox/index.js'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { FormModalHeaderWrapper } from '../../../components/FormModalHeaderWrapper'
import { RadioSelect } from '../../../components/RadioSelect'
import { SwitchWithLabel } from '../../../components/SwitchWithLabel'
import { AuthenticationCard } from '../../../containers/AuthenticationCard'
import { CreateFileEncryptionPassword } from '../../../containers/Modal/CreateFileEncryptionPassword'
import { ModalContent } from '../../../containers/Modal/ModalContent'
import { VaultPasswordFormModalContent } from '../../../containers/Modal/VaultPasswordFormModalContent'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation.js'
import { ButtonPrimary } from '../../../lib-react-components'

export const ExportTab = () => {
  const { closeModal, setModal } = useModal()
  const { t } = useTranslation()
  const {
    isVaultProtected,
    refetch: refetchVault,
    data: currentVault
  } = useVault()

  const [exportType, setExportType] = useState('json')
  const [shouldExportEncrypted, setShouldExportEncrypted] = useState(false)

  const radioOptions = [
    { label: t('csv'), value: 'csv' },
    { label: t('json'), value: 'json' }
  ]

  const handleSubmitExport = (vaultsToExport, encryptionPassword = null) => {
    if (exportType === 'json') {
      handleExportJsonPerVaultTest(vaultsToExport, encryptionPassword)
    }
    if (exportType === 'csv') {
      handleExportCSVPerVault(vaultsToExport, encryptionPassword)
    }
  }

  const fetchProtectedVault = async (
    password,
    currentVaultId,
    currentEncryption
  ) => {
    await authoriseCurrentProtectedVault(password)

    let vault

    try {
      vault = await getVaultById(currentVaultId.id, {
        password: password
      })
    } catch (error) {
      await refetchVault(currentVaultId, currentEncryption)
      throw error
    }

    const records = (await listRecords()) ?? []
    const vaultData = [{ ...vault, records }]

    if (shouldExportEncrypted) {
      setModal(
        html`<${CreateFileEncryptionPassword}
          onSubmit=${(encryptionPassword) => {
            handleSubmitExport(vaultData, encryptionPassword)
            closeModal()
          }}
        />`,
        { replace: true }
      )
    } else {
      handleSubmitExport(vaultData, null)
      closeModal()
    }

    await refetchVault(currentVaultId, currentEncryption)
  }

  const fetchUnprotectedVault = async (vaultId) => {
    const vault = await getVaultById(vaultId)
    const records = (await listRecords()) ?? []

    return { ...vault, records }
  }

  const onUnprotectedExport = async () => {
    const vaultsToExport = await fetchUnprotectedVault(currentVault.id)

    if (shouldExportEncrypted) {
      setModal(
        html`<${CreateFileEncryptionPassword}
          onSubmit=${(encryptionPassword) => {
            handleSubmitExport([vaultsToExport], encryptionPassword)
            closeModal()
          }}
        />`,
        { replace: true }
      )
    } else {
      handleSubmitExport([vaultsToExport], null)
      closeModal()
    }
  }

  const handleExport = async () => {
    const currentVaultId = currentVault?.id
    const isCurrentVaultProtected = await isVaultProtected(currentVaultId)
    const currentEncryption = isCurrentVaultProtected
      ? await getCurrentProtectedVaultEncryption(currentVaultId)
      : await getMasterEncryption()

    if (isCurrentVaultProtected) {
      setModal(
        html`<${VaultPasswordFormModalContent}
          vault=${currentVault.id}
          onSubmit=${async (password) => {
            await fetchProtectedVault(
              password,
              currentVaultId,
              currentEncryption
            )
            closeModal()
          }}
        />`
      )
    } else {
      setModal(html`
        <${ModalContent}
          onClose=${closeModal}
          headerChildren=${html` <${FormModalHeaderWrapper}> <//> `}
        >
          <${AuthenticationCard}
            title=${t('Enter Your Master Password')}
            buttonLabel=${t('Confirm')}
            descriptionComponent=${html`<${AlertBox}
              message=${t(
                'Confirm your master password to export your vault data.'
              )}
            />`}
            style=${{ width: '100%' }}
            onSuccess=${onUnprotectedExport}
          />
        <//>
      `)
    }
  }

  useEffect(() => {
    refetchVault()
  }, [])

  return html` <${CardSingleSetting}
    testId="settings-card-export-vault"
    title=${t('Export Vault')}
  >
    <${ContentContainer}>
      <${RadioSelect}
        title=${t('Choose the file format to export your Vault')}
        options=${radioOptions}
        selectedOption=${exportType}
        onChange=${(type) => {
          if (type === 'csv' && shouldExportEncrypted) {
            setShouldExportEncrypted(false)
          }

          setExportType(type)
        }}
      />

      <${SwitchWithLabel}
        description=${t(
          'Encrypt the Vault file with the *specific encryption*'
        )}
        label=${t('Encrypted file')}
        isOn=${shouldExportEncrypted}
        onChange=${() => {
          setExportType('json')

          setShouldExportEncrypted((prev) => !prev)
        }}
        isLabelBold
      />

      <${ActionsContainer}>
        <${ButtonPrimary} width="180px" onClick=${handleExport}>
          ${t('Export')}
        <//>
      <//>
    <//>
  <//>`
}
