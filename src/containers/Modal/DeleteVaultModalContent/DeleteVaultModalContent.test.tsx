import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  broadcastDeleteVault,
  useCreateVault,
  useUserData,
  useVault,
  useVaults
} from '@tetherto/pearpass-lib-vault'

import { DeleteVaultModalContent } from './DeleteVaultModalContent'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { useVaultSwitch } from '../../../hooks/useVaultSwitch'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  broadcastDeleteVault: jest.fn(),
  useCreateVault: jest.fn(),
  useUserData: jest.fn(),
  useVault: jest.fn(),
  useVaults: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-vault/src/utils/buffer', () => ({
  stringToBuffer: (s: string) => s,
  clearBuffer: jest.fn()
}))

jest.mock('../../../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../../../context/RouterContext', () => ({
  useRouter: jest.fn()
}))

jest.mock('../../../context/ToastContext', () => ({
  useToast: jest.fn()
}))

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: jest.fn()
}))

jest.mock('../../../hooks/useVaultSwitch', () => ({
  useVaultSwitch: jest.fn()
}))

jest.mock('../PairedDevicesModalContent', () => ({
  PairedDevicesModalContent: () => null
}))

jest.mock('../../../utils/logger', () => ({
  logger: { error: jest.fn() }
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const liftTestID = ({ testID, ...rest }: any) =>
    testID ? { ...rest, 'data-testid': testID } : rest
  return {
    rawTokens: new Proxy({}, { get: () => 0 }),
    AlertMessage: (props: any) => {
      const { description, ...rest } = liftTestID(props)
      return (
        <div role="alert" {...rest}>
          {description}
        </div>
      )
    },
    Button: ({ children, onClick, disabled, ...rest }: any) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        {...liftTestID(rest)}
      >
        {children}
      </button>
    ),
    Dialog: ({ children, footer }: any) => (
      <div>
        {children}
        {footer}
      </div>
    ),
    Form: ({ children, onSubmit }: any) => (
      <form onSubmit={onSubmit}>{children}</form>
    ),
    Link: ({ children, onClick, ...rest }: any) => (
      <button type="button" onClick={onClick} {...liftTestID(rest)}>
        {children}
      </button>
    ),
    PasswordField: (props: any) => {
      const { onChange, value, label, ...rest } = liftTestID(props)
      return (
        <input
          type="password"
          aria-label={label}
          value={value ?? ''}
          onChange={(e) => onChange?.(e)}
          {...rest}
        />
      )
    },
    Text: ({ children }: any) => <span>{children}</span>,
    ToggleSwitch: (props: any) => {
      const {
        checked,
        onChange,
        'aria-label': ariaLabel,
        ...rest
      } = liftTestID(props)
      return (
        <input
          type="checkbox"
          aria-label={ariaLabel}
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          {...rest}
        />
      )
    }
  }
})

const mockedUseVault = jest.mocked(useVault)
const mockedUseVaults = jest.mocked(useVaults)
const mockedUseUserData = jest.mocked(useUserData)
const mockedUseCreateVault = jest.mocked(useCreateVault)
const mockedUseModal = jest.mocked(useModal)
const mockedUseRouter = jest.mocked(useRouter)
const mockedUseToast = jest.mocked(useToast)
const mockedUseTranslation = jest.mocked(useTranslation)
const mockedUseVaultSwitch = jest.mocked(useVaultSwitch)
const mockedBroadcast = jest.mocked(broadcastDeleteVault)

describe('DeleteVaultModalContent', () => {
  const logIn = jest.fn<(args: { password: unknown }) => Promise<void>>()
  const deleteVaultLocal = jest.fn<(id: string) => Promise<void>>()
  const addDevice = jest.fn<() => Promise<void>>()
  const createVault = jest.fn<(args: { name: string }) => Promise<void>>()
  const setModal = jest.fn()
  const closeModal = jest.fn()
  const setToast = jest.fn()
  const navigate = jest.fn()
  const switchVault = jest.fn<(v: unknown) => Promise<void>>()
  const t = jest.fn((s: string) => s)

  const baseVaults = [
    { id: 'v1', name: 'V1' },
    { id: 'v2', name: 'V2' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    logIn.mockResolvedValue(undefined)
    deleteVaultLocal.mockResolvedValue(undefined)
    addDevice.mockResolvedValue(undefined)
    createVault.mockResolvedValue(undefined)
    switchVault.mockResolvedValue(undefined)
    mockedBroadcast.mockResolvedValue({ results: [], failures: [] } as never)

    mockedUseVault.mockReturnValue({
      data: { id: 'v1', devices: [{ id: 'd1' }, { id: 'd2' }] },
      deleteVaultLocal,
      addDevice
    } as unknown as ReturnType<typeof useVault>)
    mockedUseVaults.mockReturnValue({ data: baseVaults } as unknown as ReturnType<
      typeof useVaults
    >)
    mockedUseUserData.mockReturnValue({ logIn } as unknown as ReturnType<
      typeof useUserData
    >)
    mockedUseCreateVault.mockReturnValue({ createVault } as unknown as ReturnType<
      typeof useCreateVault
    >)
    mockedUseModal.mockReturnValue({ setModal, closeModal } as unknown as ReturnType<
      typeof useModal
    >)
    mockedUseRouter.mockReturnValue({ navigate } as unknown as ReturnType<
      typeof useRouter
    >)
    mockedUseToast.mockReturnValue({ setToast } as unknown as ReturnType<
      typeof useToast
    >)
    mockedUseTranslation.mockReturnValue({ t } as unknown as ReturnType<
      typeof useTranslation
    >)
    mockedUseVaultSwitch.mockReturnValue({ switchVault } as unknown as ReturnType<
      typeof useVaultSwitch
    >)
  })

  const renderModal = () =>
    render(<DeleteVaultModalContent vaultId="v1" vaultName="V1" />)

  const typePassword = (value: string) => {
    const input = screen.getByTestId('delete-vault-password')
    fireEvent.change(input, { target: { value } })
  }

  const submit = async () => {
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-vault-submit'))
    })
  }

  it('rejects an invalid master password: no broadcast, no delete', async () => {
    logIn.mockRejectedValue(new Error('bad password'))

    renderModal()
    typePassword('wrong')
    await submit()

    expect(logIn).toHaveBeenCalled()
    expect(mockedBroadcast).not.toHaveBeenCalled()
    expect(deleteVaultLocal).not.toHaveBeenCalled()
    expect(closeModal).not.toHaveBeenCalled()
  })

  it('with erase-all on and broadcast failure: surfaces toast but still deletes locally', async () => {
    mockedBroadcast.mockResolvedValue({
      results: [],
      failures: [{ targetDeviceId: 'peer-A', error: new Error('boom') }]
    } as never)

    renderModal()
    typePassword('right')
    fireEvent.click(screen.getByTestId('delete-vault-eraseall-toggle'))
    await submit()

    expect(mockedBroadcast).toHaveBeenCalledWith('v1')
    expect(deleteVaultLocal).toHaveBeenCalledWith('v1')
    const toastMessages = setToast.mock.calls.map(
      (c) => (c[0] as { message: string }).message
    )
    expect(toastMessages.some((m) => /next time they come online/.test(m))).toBe(
      true
    )
  })

  it('creates a fallback Personal vault when the last vault is removed', async () => {
    mockedUseVaults.mockReturnValue({
      data: [{ id: 'v1', name: 'V1' }]
    } as unknown as ReturnType<typeof useVaults>)

    renderModal()
    typePassword('right')
    await submit()

    expect(deleteVaultLocal).toHaveBeenCalledWith('v1')
    expect(createVault).toHaveBeenCalled()
    expect(addDevice).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('vault', { recordType: 'all' })
  })

  it('toasts a recovery error when fallback Personal creation fails', async () => {
    mockedUseVaults.mockReturnValue({
      data: [{ id: 'v1', name: 'V1' }]
    } as unknown as ReturnType<typeof useVaults>)
    createVault.mockRejectedValue(new Error('boom'))

    renderModal()
    typePassword('right')
    await submit()

    const toastMessages = setToast.mock.calls.map(
      (c) => (c[0] as { message: string }).message
    )
    expect(
      toastMessages.some((m) => /Couldn't create a starter vault/.test(m))
    ).toBe(true)
  })
})
