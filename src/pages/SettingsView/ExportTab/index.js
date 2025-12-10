import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import {
  authoriseCurrentProtectedVault,
  getVaultById,
  getCurrentProtectedVaultEncryption,
  listRecords,
  useVault,
  useVaults,
  getMasterEncryption
} from 'pearpass-lib-vault'

import { ActionsContainer, ContentContainer, Description } from './styles'
import { handleExportCSVPerVault } from './utils/exportCsvPerVault'
import { handleExportJsonPerVaultTest } from './utils/exportJsonPerVault'
import { AlertBox } from '../../../components/AlertBox/index.js'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { FormModalHeaderWrapper } from '../../../components/FormModalHeaderWrapper'
import { ListItem } from '../../../components/ListItem'
import { RadioSelect } from '../../../components/RadioSelect'
import { SwitchWithLabel } from '../../../components/SwitchWithLabel'
import { AuthenticationCard } from '../../../containers/AuthenticationCard'
import { ModalContent } from '../../../containers/Modal/ModalContent'
import { VaultPasswordFormModalContent } from '../../../containers/Modal/VaultPasswordFormModalContent'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation.js'
import { ButtonSecondary } from '../../../lib-react-components'
import { vaultCreatedFormat } from '../../../utils/vaultCreated'

export const ExportTab = () => {
  const { closeModal, setModal } = useModal()
  const { t } = useTranslation()
  const { data } = useVaults()
  const {
    isVaultProtected,
    refetch: refetchVault,
    data: currentVault
  } = useVault()

  const [selectedVaults, setSelectedVaults] = useState([])
  const [selectedProtectedVault, setSelectedProtectedVault] = useState(null)
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

    setSelectedVaults([])
    setSelectedProtectedVault(null)
    setShouldExportEncrypted(false)
  }

  const fetchProtectedVault = async (
    password,
    currentVaultId,
    currentEncryption
  ) => {
    if (
      selectedProtectedVault?.id &&
      currentVaultId === selectedProtectedVault.id
    ) {
      await authoriseCurrentProtectedVault(password)
    }

    let vault

    try {
      vault = await getVaultById(selectedProtectedVault.id, {
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

  const handleVaultClick = async (vault) => {
    const isProtected = await isVaultProtected(vault.id)

    if (isProtected) {
      setSelectedProtectedVault(
        selectedProtectedVault?.id === vault.id ? null : vault
      )
      setSelectedVaults([])
      return
    }

    setSelectedVaults((prev) =>
      prev.includes(vault.id)
        ? prev.filter((vaultId) => vaultId !== vault.id)
        : [...prev, vault.id]
    )
    setSelectedProtectedVault(null)
  }

  const handleExport = async () => {
    const currentVaultId = currentVault?.id
    const isCurrentVaultProtected = await isVaultProtected(currentVaultId)
    const currentEncryption = isCurrentVaultProtected
      ? await getCurrentProtectedVaultEncryption(currentVaultId)
      : await getMasterEncryption()

    if (selectedProtectedVault) {
      setModal(
        html`<${VaultPasswordFormModalContent}
          vault=${selectedProtectedVault}
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
    } else if (selectedVaults.length > 0) {
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
              const vaultsToExport = await Promise.all(
                selectedVaults.map(
                  async (vaultId) => await fetchUnprotectedVault(vaultId)
                )
              )

              refetchVault(currentVaultId, currentEncryption)
              handleSubmitExport(vaultsToExport)
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

  return html` <${CardSingleSetting} title=${t('Export')}>
    <${ContentContainer}>
      <${Description}>
        ${t(
          'Choose which Vaults do you want to backup and select if you want the file encrypted'
        )}
      <//>
      ${data?.map(
        (vault) =>
          html`<${ListItem}
            key=${vault.name}
            itemName=${vault.name}
            itemDateText=${vaultCreatedFormat(vault.createdAt)}
            onClick=${() => handleVaultClick(vault)}
            isSelected=${selectedVaults.includes(vault.id) ||
            vault.id === selectedProtectedVault?.id}
          />`
      )}

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
        title=${t('Type')}
        options=${radioOptions}
        selectedOption=${exportType}
        onChange=${(type) => {
          setExportType(type)
        }}
      />

      <${ActionsContainer}>
        <${ButtonSecondary}
          onClick=${handleExport}
          disabled=${!selectedVaults.length && !selectedProtectedVault}
        >
          ${t('Export')}
        <//>
      <//>
    <//>
  <//>`
}
