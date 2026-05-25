/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  decryptBitwardenJson,
  decryptKeePassKdbx,
  parseBitwardenData,
  parseKeePassData
} from '@tetherto/pearpass-lib-data-import'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'

import { readFileContent } from '../../utils/readFileContent'
import { ImportItemsContent } from './index'
;(globalThis as { React?: typeof React }).React = React

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../context/LoadingContext', () => ({
  useGlobalLoading: jest.fn()
}))

const mockSetToast = jest.fn()
jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    setToast: mockSetToast
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useCreateRecord: () => ({
    createRecord: jest.fn()
  }),
  decryptExportData: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-vault/src/instances', () => ({
  pearpassVaultClient: {
    decryptBitwardenExport: jest.fn(),
    keepassArgon2: jest.fn()
  }
}))

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  MAX_IMPORT_RECORDS: 1000
}))

jest.mock('@tetherto/pearpass-lib-data-import', () => ({
  decryptKeePassKdbx: jest.fn(),
  decryptBitwardenJson: jest.fn(),
  parse1PasswordData: jest.fn(),
  parseBitwardenData: jest.fn(),
  parseKeePassData: jest.fn(),
  parseLastPassData: jest.fn(),
  parseNordPassData: jest.fn(),
  parsePearPassData: jest.fn(),
  parseProtonPassData: jest.fn()
}))

jest.mock('../../utils/readFileContent', () => ({
  readFileContent: jest.fn()
}))

jest.mock('../../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    container: {},
    listWrapper: {},
    listItems: {},
    listItemBorder: {},
    backButton: {},
    header: {},
    passwordSection: {},
    uploadArea: {},
    footer: {}
  })
}))

const mockTheme = {
  theme: {
    colors: {
      colorTextSecondary: '#888',
      colorTextPrimary: '#fff'
    }
  }
}

// Drives the mock UploadField — tests set this before triggering an upload.
let mockUploadFile = { name: 'bitwarden-export.json', size: 2048 }

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => mockTheme,
  PageHeader: ({ title }: { title: React.ReactNode }) => <h1>{title}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertMessage: (props: { testID?: string; title?: React.ReactNode }) => (
    <div data-testid={props.testID}>{props.title}</div>
  ),
  Link: (props: { children?: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={props.onClick}>
      {props.children}
    </button>
  ),
  ListItem: (props: {
    testID?: string
    title?: React.ReactNode
    subtitle?: React.ReactNode
    onClick?: () => void
  }) => (
    <button type="button" data-testid={props.testID} onClick={props.onClick}>
      <span>{props.title}</span>
      <span>{props.subtitle}</span>
    </button>
  ),
  UploadField: (props: {
    testID?: string
    onFilesChange?: (files: { file: { name: string; size: number } }[]) => void
  }) => (
    <div data-testid={props.testID}>
      <button
        type="button"
        data-testid="mock-upload-trigger"
        onClick={() => props.onFilesChange?.([{ file: mockUploadFile }])}
      >
        upload-field
      </button>
    </div>
  ),
  PasswordField: (props: {
    testID?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) => (
    <input
      data-testid={props.testID}
      value={props.value}
      onChange={props.onChange}
    />
  ),
  Button: (props: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    'aria-label'?: string
  }) => (
    <button
      type="button"
      aria-label={props['aria-label']}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  ArrowBackOutined: () => null,
  KeyboardArrowRightFilled: () => null
}))

const mockReadFileContent = jest.mocked(readFileContent)
const mockDecryptBitwardenJson = jest.mocked(decryptBitwardenJson)
const mockParseBitwardenData = jest.mocked(parseBitwardenData)
const mockDecryptKeePassKdbx = jest.mocked(decryptKeePassKdbx)
const mockParseKeePassData = jest.mocked(parseKeePassData)
const mockKeepassArgon2 = jest.mocked(pearpassVaultClient.keepassArgon2)

describe('ImportItemsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUploadFile = { name: 'bitwarden-export.json', size: 2048 }
  })

  it('renders import sources list', () => {
    render(<ImportItemsContent />)

    expect(
      screen.getByRole('heading', { name: 'Import Items' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('settings-import-1password')).toBeInTheDocument()
    expect(screen.getByTestId('settings-import-bitwarden')).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-import-unencrypted')
    ).toBeInTheDocument()
  })

  it('opens upload step and can navigate back', () => {
    render(<ImportItemsContent />)

    fireEvent.click(screen.getByTestId('settings-import-bitwarden'))

    expect(screen.getByText('Import from Bitwarden')).toBeInTheDocument()
    expect(screen.getByTestId('import-upload-field')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'back' }))

    expect(
      screen.getByRole('heading', { name: 'Import Items' })
    ).toBeInTheDocument()
  })

  it('gates an encrypted Bitwarden JSON on the password screen and decrypts it', async () => {
    const encryptedBitwardenJson = JSON.stringify({
      encrypted: true,
      passwordProtected: true,
      kdfType: 0,
      kdfIterations: 600000,
      salt: 'salt',
      data: 'cipher-text'
    })
    mockReadFileContent.mockResolvedValue(encryptedBitwardenJson)
    mockDecryptBitwardenJson.mockResolvedValue({ items: [], folders: [] })
    mockParseBitwardenData.mockResolvedValue([{ type: 'login' }])

    render(<ImportItemsContent />)

    fireEvent.click(screen.getByTestId('settings-import-bitwarden'))
    fireEvent.click(screen.getByTestId('mock-upload-trigger'))

    // The export is password-protected, so the Import button advances to the
    // password screen rather than importing directly.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import' })).not.toBeDisabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    const passwordField = await screen.findByTestId(
      'import-file-password-field'
    )
    fireEvent.change(passwordField, { target: { value: 'my-file-password' } })

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(mockDecryptBitwardenJson).toHaveBeenCalledTimes(1)
    })
    expect(mockDecryptBitwardenJson).toHaveBeenCalledWith(
      encryptedBitwardenJson,
      'my-file-password',
      expect.objectContaining({ decryptViaWorklet: expect.any(Function) })
    )
    expect(mockParseBitwardenData).toHaveBeenCalledWith(
      { items: [], folders: [] },
      'json'
    )
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Data imported successfully'
    })
  })

  it('does not prompt for a password for an account-restricted Bitwarden export', async () => {
    // Account-restricted exports set `encrypted: true` only — they are parsed
    // directly instead of being gated on a password screen that can never
    // succeed.
    const accountRestrictedJson = JSON.stringify({
      encrypted: true,
      data: 'account-key-cipher'
    })
    mockReadFileContent.mockResolvedValue(accountRestrictedJson)
    mockParseBitwardenData.mockResolvedValue([{ type: 'login' }])

    render(<ImportItemsContent />)

    fireEvent.click(screen.getByTestId('settings-import-bitwarden'))
    fireEvent.click(screen.getByTestId('mock-upload-trigger'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import' })).not.toBeDisabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(() => {
      expect(mockParseBitwardenData).toHaveBeenCalledWith(
        accountRestrictedJson,
        'json'
      )
    })
    expect(mockDecryptBitwardenJson).not.toHaveBeenCalled()
    expect(
      screen.queryByTestId('import-file-password-field')
    ).not.toBeInTheDocument()
  })

  it('gates a KeePass .kdbx on the password screen and decrypts it via the worklet', async () => {
    // A .kdbx is a binary encrypted database — it always needs the master
    // password, and its Argon2 KDF is offloaded to the vault worklet.
    const kdbxBuffer = new ArrayBuffer(16)
    const rootGroup = { name: 'Root', entries: [], groups: [] }
    mockUploadFile = { name: 'vault.kdbx', size: 4096 }
    mockReadFileContent.mockResolvedValue(kdbxBuffer)
    mockDecryptKeePassKdbx.mockResolvedValue(rootGroup)
    mockParseKeePassData.mockResolvedValue([{ type: 'login' }])
    mockKeepassArgon2.mockResolvedValue('derived-key-base64')

    render(<ImportItemsContent />)

    fireEvent.click(screen.getByTestId('settings-import-keepass'))
    fireEvent.click(screen.getByTestId('mock-upload-trigger'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import' })).not.toBeDisabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    // The .kdbx always gates on the password screen, which warns that
    // Argon2 decryption can be slow.
    const passwordField = await screen.findByTestId(
      'import-file-password-field'
    )
    expect(screen.getByTestId('import-argon2-warning')).toBeInTheDocument()
    fireEvent.change(passwordField, { target: { value: 'db-password' } })

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(mockDecryptKeePassKdbx).toHaveBeenCalledTimes(1)
    })
    expect(mockDecryptKeePassKdbx).toHaveBeenCalledWith(
      kdbxBuffer,
      'db-password',
      expect.objectContaining({ argon2ViaWorklet: expect.any(Function) })
    )

    // The worklet hook delegates to pearpassVaultClient.keepassArgon2.
    const { argon2ViaWorklet } = mockDecryptKeePassKdbx.mock.calls[0][2]!
    await argon2ViaWorklet!({
      password: 'cA==',
      salt: 'cw==',
      type: 'argon2d',
      memory: 65536,
      iterations: 3,
      parallelism: 4,
      length: 32,
      version: 0x13
    })
    expect(mockKeepassArgon2).toHaveBeenCalledTimes(1)

    expect(mockParseKeePassData).toHaveBeenCalledWith(rootGroup, 'kdbx')
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Data imported successfully'
    })
  })
})
