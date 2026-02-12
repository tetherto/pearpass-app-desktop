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

import { ContentContainer, Description, ImportOptionsContainer } from './styles'
import { readFileContent } from './utils/readFileContent'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { ImportDataOption } from '../../../components/ImportDataOption'
import { ModalContent } from '../../../containers/Modal/ModalContent'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { ButtonPrimary } from '../../../lib-react-components'
import { logger } from '../../../utils/logger'

const importOptions = [
  {
    title: '1Password',
    type: '1password',
    accepts: ['.csv'],
    imgSrc: '/assets/images/1password.png'
  },
  {
    title: 'Bitwarden',
    type: 'bitwarden',
    accepts: ['.json', '.csv'],
    imgSrc: '/assets/images/BitWarden.png'
  },
  {
    title: 'KeePass',
    type: 'keepass',
    accepts: ['.kdbx', '.csv', '.xml'],
    imgSrc: '/assets/images/KeePass.png'
  },
  {
    title: 'KeePassXC',
    type: 'keepass',
    accepts: ['.kdbx', '.csv', '.xml'],
    imgSrc: '/assets/images/KeePassXC.png'
  },
  {
    title: 'LastPass',
    type: 'lastpass',
    accepts: ['.csv'],
    imgSrc: '/assets/images/LastPass.png'
  },
  {
    title: 'NordPass',
    type: 'nordpass',
    accepts: ['.csv'],
    imgSrc: '/assets/images/NordPass.png'
  },
  {
    title: 'Proton Pass',
    type: 'protonpass',
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

const KdbxPasswordPrompt = ({ onSubmit, onClose, error }) => {
  const [password, setPassword] = useState('')
  const { t } = useTranslation()

  return html`<${ModalContent}
    onClose=${onClose}
    onSubmit=${() => onSubmit(password)}
    headerChildren=${html`<span>${t('Enter KeePass Password')}</span>`}
  >
    <div
      style=${{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px'
      }}
    >
      <input
        type="password"
        placeholder=${t('Database password')}
        value=${password}
        autofocus
        onChange=${(e) => setPassword(e.target.value)}
        style=${{
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid #555',
          backgroundColor: 'transparent',
          color: '#fff',
          fontSize: '14px',
          outline: 'none'
        }}
      />
      ${error &&
      html`<span style=${{ color: '#ff4d4f', fontSize: '12px' }}
        >${error}</span
      >`}
      <${ButtonPrimary} type="submit" size="md" disabled=${!password}>
        ${t('Unlock & Import')}
      <//>
    </div>
  <//>`
}

export const ImportTab = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()
  const { setModal, closeModal } = useModal()

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

  const showKdbxPasswordPrompt = (fileBuffer) => {
    const attemptDecrypt = async (password, errorMsg) => {
      setModal(
        html`<${KdbxPasswordPrompt}
          onClose=${closeModal}
          error=${errorMsg || ''}
          onSubmit=${async (pwd) => {
            try {
              const result = await parseKeePassData(fileBuffer, 'kdbx', pwd)
              closeModal()
              await importRecords(result)
            } catch (err) {
              if (err.message === 'Incorrect password') {
                attemptDecrypt(pwd, t('Incorrect password. Please try again.'))
              } else {
                closeModal()
                setToast({ message: t(err.message) })
                logger.error('KeePass KDBX import', err.message)
              }
            }
          }}
        />`,
        { replace: true }
      )
    }
    attemptDecrypt()
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
      const fileContent = await readFileContent(file, { as: 'buffer' })
      showKdbxPasswordPrompt(fileContent)
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
      logger.error(
        'useGetMultipleFiles',
        'Error reading file:',
        error.message || error
      )
    }
  }

  return html` <${CardSingleSetting} title=${t('Import Vault')}>
    <${ContentContainer}>
      <${Description}>
        ${t(
          "Move your saved items here from another password manager. They'll be added to this vault."
        )}
      <//>

      <${ImportOptionsContainer}>
        ${importOptions.map(
          ({ title, accepts, type, imgSrc, icon }) =>
            html`<${ImportDataOption}
              key=${title}
              title=${title}
              accepts=${accepts}
              imgSrc=${imgSrc}
              icon=${icon}
              onFilesSelected=${(files) => {
                handleFileChange({ files, type, accepts })
              }}
            />`
        )}
      <//>
    <//>
  <//>`
}
