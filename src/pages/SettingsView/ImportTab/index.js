import { html } from 'htm/react'
import { MAX_IMPORT_RECORDS } from 'pearpass-lib-constants'
import {
  decryptKeePassKdbx,
  parse1PasswordData,
  parseBitwardenData,
  parseKeePassData,
  parseLastPassData,
  parseNordPassData,
  parsePearPassData,
  parseProtonPassData
} from 'pearpass-lib-data-import'
import { decryptExportData, useCreateRecord } from 'pearpass-lib-vault'

import { ContentContainer, Description, ImportOptionsContainer } from './styles'
import { readFileContent } from './utils/readFileContent'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { ImportDataOption } from '../../../components/ImportDataOption'
import { DecryptFilePassword } from '../../../containers/Modal/DecryptFilePassword'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { logger } from '../../../utils/logger'

const importOptions = [
  {
    title: '1Password',
    type: '1password',
    testId: 'settings-import-1password',
    accepts: ['.csv'],
    imgSrc: 'assets/images/1password.png'
  },
  {
    title: 'Bitwarden',
    type: 'bitwarden',
    testId: 'settings-import-bitwarden',
    accepts: ['.json', '.csv'],
    imgSrc: 'assets/images/BitWarden.png'
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
    imgSrc: 'assets/images/LastPass.png'
  },
  {
    title: 'NordPass',
    type: 'nordpass',
    testId: 'settings-import-nordpass',
    accepts: ['.csv'],
    imgSrc: 'assets/images/NordPass.png'
  },
  {
    title: 'Proton Pass',
    type: 'protonpass',
    testId: 'settings-import-protonpass',
    accepts: ['.csv', '.json'],
    imgSrc: 'assets/images/ProtonPass.png'
  },
  {
    title: 'Encrypted file',
    type: 'encrypted',
    accepts: ['.pearpass'],
    imgSrc: '/assets/images/pearpass_logo.png'
  },
  {
    title: 'Unencrypted file',
    type: 'unencrypted',
    testId: 'settings-import-unencrypted',
    accepts: ['.json', '.csv'],
    imgSrc: 'assets/images/pearpass_logo.png'
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
  const { setIsLoading } = useLoadingContext()
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

  const handleFileChange = async ({ files, type, accepts }) => {
    let isFileEncrypted = false
    let encryptedData

    const file = files[0]
    if (!file) return

    const filename = file.name
    const fileType = filename.split('.').pop()

    if (!isAllowedType(fileType, accepts)) {
      throw new Error('Invalid file type')
    }

    if (type === 'keepass' && fileType === 'kdbx') {
      try {
        isFileEncrypted = true
        encryptedData = await readFileContent(file, { as: 'buffer' })
      } catch (error) {
        setToast({ message: t('Failed to read file') })
        logger.error(
          'KeePass KDBX import',
          'Error reading file:',
          error.message || error
        )
      }
    }

    if (type === 'encrypted') {
      try {
        isFileEncrypted = true
        encryptedData = await readFileContent(file)
      } catch (error) {
        setToast({ message: t('Failed to read file') })
        logger.error(
          'Encrypted file import',
          'Error reading file:',
          error.message || error
        )
      }
    }

    if (isFileEncrypted) {
      setModal(
        <DecryptFilePassword
          encryptedData={encryptedData}
          onSubmit={async (password) => {
            await onImport({
              type,
              fileContent: encryptedData,
              fileType,
              password,
              isEncrypted: true
            })
          }}
        />,
        { replace: true }
      )

      return
    }

    const fileContent = await readFileContent(file)

    await onImport({ type, fileContent, fileType })
  }

  const onImport = async ({
    type,
    fileContent,
    fileType,
    password,
    isEncrypted
  }) => {
    setIsLoading(true)
    let result = []
    let dataToProcess = fileContent

    try {
      if (type === 'keepass' && fileType === 'kdbx') {
        if (!password) {
          throw new Error('Password is required for encrypted files')
        }

        dataToProcess = await decryptKeePassKdbx(fileContent, password)
        type = 'keepass-kdbx'
      }

      if (type === 'encrypted' && isEncrypted) {
        if (!password) {
          throw new Error('Password is required for encrypted files')
        }

        const encryptedData = JSON.parse(fileContent)
        dataToProcess = await decryptExportData(encryptedData, password)
      }
    } catch {
      throw new Error(
        'Failed to decrypt file. Please check your password and try again.'
      )
    }

    try {
      switch (type) {
        case '1password':
          result = await parse1PasswordData(dataToProcess, fileType)
          break
        case 'bitwarden':
          result = await parseBitwardenData(dataToProcess, fileType)
          break
        case 'lastpass':
          result = await parseLastPassData(dataToProcess, fileType)
          break
        case 'keepass':
          result = await parseKeePassData(dataToProcess, fileType)
          break
        case 'keepass-kdbx':
          result = await parseKeePassData(dataToProcess, 'kdbx')
          break
        case 'nordpass':
          result = await parseNordPassData(dataToProcess, fileType)
          break
        case 'protonpass':
          result = await parseProtonPassData(dataToProcess, fileType)
          break
        case 'unencrypted':
          result = await parsePearPassData(dataToProcess, fileType)
          break
        case 'encrypted':
          result = await parsePearPassData(dataToProcess, 'json')
          break
        default:
          throw new Error(
            'Unsupported template type. Please select a valid import option.'
          )
      }

      await importRecords(result)
    } catch (error) {
      throw new Error(
        error.message || 'Failed to parse file. Please ensure it is valid.'
      )
    } finally {
      setIsLoading(false)
      closeModal()
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
  </div>`
}
