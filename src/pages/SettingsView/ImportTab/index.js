import { useState } from 'react'

import { html } from 'htm/react'
import { MAX_IMPORT_RECORDS } from 'pearpass-lib-constants'
import {
  parse1PasswordData,
  parseBitwardenData,
  parseKeePassData,
  parseLastPassData,
  parseNordPassData,
  parsePearPassData,
  parseProtonPassData
} from 'pearpass-lib-data-import'
import { useCreateRecord } from 'pearpass-lib-vault'

import {
  ContentContainer,
  Description,
  ErrorText,
  ImportOptionsContainer,
  ModalTitle,
  PasswordInput
} from './styles'
import { readFileContent } from './utils/readFileContent'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { ImportDataOption } from '../../../components/ImportDataOption'
import { Overlay } from '../../../components/Overlay'
import { ModalWrapper } from '../../../containers/Modal'
import { ModalContent } from '../../../containers/Modal/ModalContent'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { ButtonPrimary } from '../../../lib-react-components'
import { logger } from '../../../utils/logger'

const importOptions = [
  {
    title: '1Password',
    type: '1password',
    testId: 'settings-import-1password',
    accepts: ['.csv'],
    imgSrc: '/assets/images/1password.png'
  },
  {
    title: 'Bitwarden',
    type: 'bitwarden',
    testId: 'settings-import-bitwarden',
    accepts: ['.json', '.csv'],
    imgSrc: '/assets/images/BitWarden.png'
  },
  {
    title: 'KeePass',
    type: 'keepass',
    testId: 'settings-import-keepass',
    accepts: ['.kdbx', '.csv', '.xml'],
    imgSrc: '/assets/images/KeePass.png'
  },
  {
    title: 'KeePassXC',
    type: 'keepass',
    testId: 'settings-import-keepassxc',
    accepts: ['.csv', '.xml'],
    imgSrc: '/assets/images/KeePassXC.png'
  },
  {
    title: 'LastPass',
    type: 'lastpass',
    testId: 'settings-import-lastpass',
    accepts: ['.csv'],
    imgSrc: '/assets/images/LastPass.png'
  },
  {
    title: 'NordPass',
    type: 'nordpass',
    testId: 'settings-import-nordpass',
    accepts: ['.csv'],
    imgSrc: '/assets/images/NordPass.png'
  },
  {
    title: 'Proton Pass',
    type: 'protonpass',
    testId: 'settings-import-protonpass',
    accepts: ['.csv', '.json'],
    imgSrc: '/assets/images/ProtonPass.png'
  },
  // Not supported yet
  // {
  //   title: 'Encrypted file',
  //   type: 'encrypted',
  //   accepts: ['.json'],
  //   icon: LockIcon
  // },
  {
    title: 'Unencrypted file',
    type: 'unencrypted',
    testId: 'settings-import-unencrypted',
    accepts: ['.json', '.csv'],
    imgSrc: '/assets/images/pearpass_logo.png'
  }
]

const isAllowedType = (fileType, accepts) =>
  accepts.some((accept) => {
    if (accept.startsWith('.')) {
      return fileType === accept.slice(1)
    }
    return fileType === accept
  })

export const ImportTab = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()
  const [kdbxModal, setKdbxModal] = useState({
    visible: false,
    fileBuffer: null,
    error: ''
  })
  const [kdbxPassword, setKdbxPassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)

  const { createRecord } = useCreateRecord()

  const onError = (error) => {
    setToast({
      message: error.message
    })
  }

  const importRecords = async (result) => {
    if (result.length === 0) {
      setToast({
        message: t('No records found to import!')
      })
      return
    }

    if (result.length > MAX_IMPORT_RECORDS) {
      setToast({
        message: t(`Too many records. Maximum is ${MAX_IMPORT_RECORDS}.`)
      })
      return
    }

    const BATCH_SIZE = 100
    const totalRecords = result.length

    for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
      const batch = result.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map((record) => createRecord(record, onError)))
    }

    setToast({
      message: t('Data imported successfully')
    })
  }

  const closeKdbxModal = () => {
    setKdbxModal({ visible: false, fileBuffer: null, error: '' })
    setKdbxPassword('')
    setIsUnlocking(false)
  }

  const handleKdbxSubmit = async () => {
    setIsUnlocking(true)
    await new Promise((r) => setTimeout(r, 0))
    try {
      const result = await parseKeePassData(
        kdbxModal.fileBuffer,
        'kdbx',
        kdbxPassword
      )
      closeKdbxModal()
      await importRecords(result)
    } catch (err) {
      if (err.message === 'Incorrect password') {
        setKdbxModal((prev) => ({
          ...prev,
          error: t('Incorrect password. Please try again.')
        }))
        setKdbxPassword('')
      } else {
        closeKdbxModal()
        setToast({ message: t(err.message) })
        logger.error('KeePass KDBX import', err.message)
      }
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleFileChange = async ({ files, type, accepts }) => {
    const file = files[0]
    if (!file) return

    const fileType = file.name.split('.').pop()
    let result = []

    if (!isAllowedType(fileType, accepts)) {
      throw new Error('Invalid file type')
    }

    if (type === 'keepass' && fileType === 'kdbx') {
      try {
        const fileContent = await readFileContent(file, { as: 'buffer' })
        setKdbxModal({ visible: true, fileBuffer: fileContent, error: '' })
        setKdbxPassword('')
      } catch (error) {
        setToast({ message: t('Failed to read file') })
        logger.error(
          'KeePass KDBX import',
          'Error reading file:',
          error.message || error
        )
      }
      return
    }

    const fileContent = await readFileContent(file)

    try {
      switch (type) {
        case '1password':
          result = await parse1PasswordData(fileContent, fileType)
          break
        case 'bitwarden':
          result = await parseBitwardenData(fileContent, fileType)
          break
        case 'keepass':
          result = await parseKeePassData(fileContent, fileType)
          break
        case 'lastpass':
          result = await parseLastPassData(fileContent, fileType)
          break
        case 'nordpass':
          result = await parseNordPassData(fileContent, fileType)
          break
        case 'protonpass':
          result = await parseProtonPassData(fileContent, fileType)
          break
        case 'unencrypted':
          result = await parsePearPassData(fileContent, fileType)
          break
        default:
          throw new Error(
            'Unsupported template type. Please select a valid import option.'
          )
      }

      await importRecords(result)
    } catch (error) {
      setToast({
        message: t('Import failed. Please check your file and try again.')
      })
      logger.error(
        'useGetMultipleFiles',
        'Error reading file:',
        error.message || error
      )
    }
  }

  return html`<div>
    <${CardSingleSetting}
      testId="settings-card-import-vault"
      title=${t('Import Vault')}
    >
      <${ContentContainer}>
        <${Description}>
          ${t(
            "Move your saved items here from another password manager. They'll be added to this vault."
          )}
        <//>

        <${ImportOptionsContainer}>
          ${importOptions.map(
            ({ title, accepts, type, imgSrc, icon, testId }) =>
              html`<${ImportDataOption}
                key=${title}
                title=${title}
                accepts=${accepts}
                imgSrc=${imgSrc}
                icon=${icon}
                testId=${testId}
                onFilesSelected=${(files) => {
                  handleFileChange({ files, type, accepts })
                }}
              />`
          )}
        <//>
      <//>
    <//>

    ${kdbxModal.visible &&
    html`<${ModalWrapper}>
      <${Overlay} isOpen=${true} onClick=${closeKdbxModal} />
      <${ModalContent}
        onClose=${closeKdbxModal}
        onSubmit=${handleKdbxSubmit}
        headerChildren=${html`<${ModalTitle}>
          ${t('Enter KeePass Password')}
        <//>`}
      >
        <div
          style=${{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px'
          }}
        >
          <${PasswordInput}
            type="password"
            placeholder=${t('Database password')}
            value=${kdbxPassword}
            autofocus
            disabled=${isUnlocking}
            onChange=${(e) => setKdbxPassword(e.target.value)}
          />
          ${kdbxModal.error && html`<${ErrorText}>${kdbxModal.error}<//>`}
          <${ButtonPrimary}
            type="submit"
            size="md"
            disabled=${!kdbxPassword || isUnlocking}
          >
            ${isUnlocking ? t('Decrypting...') : t('Unlock & Import')}
          <//>
        </div>
      <//>
    <//>`}
  </div>`
}
