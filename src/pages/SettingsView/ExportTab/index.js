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
import { ModalContent } from '../../../containers/Modal/ModalContent'
import { VaultPasswordFormModalContent } from '../../../containers/Modal/VaultPasswordFormModalContent'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation.js'
import { ButtonSecondary } from '../../../lib-react-components'

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

  const handleSubmitExport = (vaultsToExport) => {
    if (exportType === 'json') {
      handleExportJsonPerVaultTest(vaultsToExport)
    }
    if (exportType === 'csv') {
      handleExportCSVPerVault(vaultsToExport)
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

    handleSubmitExport([{ ...vault, records }])

    await refetchVault(currentVaultId, currentEncryption)
  }

  const fetchUnprotectedVault = async (vaultId) => {
    const vault = await getVaultById(vaultId)
    const records = (await listRecords()) ?? []

    return { ...vault, records }
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
            onSuccess=${async () => {
              const vaultsToExport = await fetchUnprotectedVault(
                currentVault.id
              )

              handleSubmitExport([vaultsToExport])
              closeModal()
            }}
          />
        <//>
      `)
    }
  }

  useEffect(() => {
    refetchVault()
  }, [])

  return html` <${CardSingleSetting} title=${t('Export Vault')}>
    <${ContentContainer}>
      <!-- not supported yet -->
      <!-- <${SwitchWithLabel}
        isSwitchFirst
        stretch=${false}
        label=${'Encrypted file'}
        isOn=${shouldExportEncrypted}
        onChange=${() => setShouldExportEncrypted((prev) => !prev)}
        isLabelBold
      /> -->

      <${RadioSelect}
        title=${t('Choose the file format to export your Vault')}
        options=${radioOptions}
        selectedOption=${exportType}
        onChange=${(type) => {
          setExportType(type)
        }}
      />

      <${ActionsContainer}>
        <${ButtonSecondary} onClick=${handleExport}> ${t('Export')} <//>
      <//>
    <//>
  <//>`
}
