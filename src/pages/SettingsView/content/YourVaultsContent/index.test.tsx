import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'

import { AddDeviceModalContent } from '../../../../containers/Modal/AddDeviceModalContent/AddDeviceModalContent'
import { CreateOrEditVaultModalContent } from '../../../../containers/Modal/CreateOrEditVaultModalContent/CreateOrEditVaultModalContent'
import { PairedDevicesModalContent } from '../../../../containers/Modal/PairedDevicesModalContent'
import { YourVaultsContent } from './index'

const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()
const mockSwitchVault = jest.fn(() => Promise.resolve())

const vaultState: {
  current: { data: { id: string; name: string } | null }
  all: { data: { id: string; name: string }[] }
  records: { data: { id: string }[] | null }
} = {
  current: {
    data: { id: 'vault-main', name: 'Main Vault' }
  },
  all: { data: [{ id: 'vault-main', name: 'Main Vault' }] },
  records: { data: [] }
}

jest.mock('../../../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: mockSetModal,
    closeModal: mockCloseModal
  })
}))

jest.mock('../../../../hooks/useVaultSwitch', () => ({
  useVaultSwitch: () => ({ switchVault: mockSwitchVault })
}))

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string, values?: { count?: number }) => {
      if (values && 'count' in values && typeof values.count === 'number') {
        return values.count === 1 ? '1 item' : `${values.count} items`
      }
      return str
    }
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVault: () => ({ data: vaultState.current.data }),
  useVaults: () => ({ data: vaultState.all.data }),
  useRecords: (_args?: unknown) => ({ data: vaultState.records.data })
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    header: {},
    section: {},
    cardList: {},
    iconWrap: {},
    actions: {},
    footer: {}
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        colorTextSecondary: '#999',
        colorTextPrimary: '#000',
        colorPrimary: '#00f',
        colorBorderPrimary: '#ccc'
      }
    }
  }),
  Button: ({
    children,
    onClick,
    'data-testid': dataTestid,
    iconBefore: _i,
    ...rest
  }: {
    children: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
    iconBefore?: React.ReactNode
  } & React.ComponentProps<'button'>) => (
    <button type="button" data-testid={dataTestid} onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  PageHeader: ({
    title,
    subtitle,
    as: _a
  }: {
    title: string
    subtitle?: React.ReactNode
    as?: string
  }) => (
    <div data-testid="settings-your-vaults-page-header">
      <h1>{title}</h1>
      {subtitle != null ? <p>{subtitle}</p> : null}
    </div>
  ),
  ContextMenu: ({
    children,
    testID,
    menuWidth: _w,
    trigger,
    ..._rest
  }: {
    children: React.ReactNode
    testID: string
    menuWidth?: number
    trigger: React.ReactNode
    [key: string]: unknown
  }) => (
    <div data-testid={testID}>
      {trigger}
      <div data-testid="context-menu-children">{children}</div>
    </div>
  ),
  ListItem: ({
    testID,
    title,
    subtitle,
    rightElement,
    onClick,
    showDivider: _d,
    dividerColor: _c,
    icon: _ic,
    ..._rest
  }: {
    testID: string
    title: string
    subtitle?: string | { primary?: string; secondary?: string }
    rightElement?: React.ReactNode
    onClick?: () => void
    [key: string]: unknown
  }) => {
    const subtitleText =
      typeof subtitle === 'object' && subtitle !== null
        ? [subtitle.primary, subtitle.secondary].filter(Boolean).join(' ')
        : subtitle
    return (
      <div data-testid={testID} onClick={onClick} role={onClick ? 'button' : undefined}>
        <span>{title}</span>
        {subtitleText ? <span>{subtitleText}</span> : null}
        {rightElement}
      </div>
    )
  },
  MultiSlotInput: ({
    children,
    testID
  }: {
    children: React.ReactNode
    testID: string
  }) => <div data-testid={testID}>{children}</div>,
  NavbarListItem: (props: {
    testID: string
    label: string
    onClick: () => void
    [key: string]: unknown
  }) => {
    const { testID, label, onClick } = props
    return (
      <button data-testid={testID} type="button" onClick={onClick}>
        {label}
      </button>
    )
  },
  Text: ({
    children,
    ..._rest
  }: {
    children: React.ReactNode
    [key: string]: unknown
  }) => <span>{children}</span>,
  Title: ({
    children,
    as: Component = 'h2'
  }: {
    children: React.ReactNode
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  }) => <Component>{children}</Component>
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: () => null,
  Devices: () => null,
  Edit: () => null,
  LockOutlined: () => null,
  MoreVert: () => null,
  PersonAdd: () => null
}))

const resetVaultFixtures = () => {
  vaultState.current = {
    data: { id: 'vault-main', name: 'Main Vault' }
  }
  vaultState.all = {
    data: [{ id: 'vault-main', name: 'Main Vault' }]
  }
  vaultState.records = { data: [] }
}

describe('YourVaultsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetVaultFixtures()
  })

  it('renders null when there is no current vault', () => {
    vaultState.current = { data: null }

    const { container } = render(<YourVaultsContent />)

    expect(container.firstChild).toBeNull()
  })

  it('renders the card, current vault row, and create button for a single vault', () => {
    render(<YourVaultsContent />)

    expect(screen.getByTestId('settings-card-your-vault')).toBeInTheDocument()
    expect(screen.getByText('Your Vaults')).toBeInTheDocument()
    expect(screen.getByText('Current Vault')).toBeInTheDocument()
    const row = screen.getByTestId('settings-vault-item')
    expect(row.textContent).toContain('Main Vault')
    expect(row.textContent).toContain('0 items')
    expect(
      screen.queryByTestId('settings-other-vaults-multislot')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('settings-your-vaults-create').textContent).toBe(
      'Create new Vault'
    )
  })

  it('lists other vaults when the user has more than one vault', () => {
    vaultState.all = {
      data: [
        { id: 'vault-main', name: 'Main Vault' },
        { id: 'vault-other', name: 'Second Vault' }
      ]
    }

    render(<YourVaultsContent />)

    expect(screen.getByText('Other Vaults')).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-other-vault-Second Vault-0')
    ).toBeInTheDocument()
  })

  it('delegates switching another vault to useVaultSwitch', async () => {
    vaultState.all = {
      data: [
        { id: 'vault-main', name: 'Main Vault' },
        { id: 'vault-other', name: 'Second Vault' }
      ]
    }

    render(<YourVaultsContent />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-other-vault-Second Vault-0'))
    })

    expect(mockSwitchVault).toHaveBeenCalledTimes(1)
    expect(mockSwitchVault).toHaveBeenCalledWith(
      { id: 'vault-other', name: 'Second Vault' },
      expect.any(Function)
    )
  })

  it('opens the add-device modal when the invite control is used', () => {
    render(<YourVaultsContent />)

    fireEvent.click(screen.getByTestId('settings-vault-invite-button'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const arg = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(arg.type).toBe(AddDeviceModalContent)
  })

  it('opens the create-vault modal with shouldRedirectToMain false when create is pressed', () => {
    render(<YourVaultsContent />)

    fireEvent.click(screen.getByTestId('settings-your-vaults-create'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const el = mockSetModal.mock.calls[0][0] as React.ReactElement<
      Record<string, unknown>
    >
    expect(el.type).toBe(CreateOrEditVaultModalContent)
    const props = el.props as {
      shouldRedirectToMain?: boolean
      onClose: () => void
      onSuccess: () => void
    }
    expect(props.shouldRedirectToMain).toBe(false)
    expect(props.onClose).toBe(mockCloseModal)
    expect(props.onSuccess).toBe(mockCloseModal)
  })

  it('opens the see-devices modal when the devices button is used', async () => {
    render(<YourVaultsContent />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-vault-more-button'))
    })

    const devicesBtn = screen.getByTestId('settings-vault-devices-button')
    await act(async () => {
      fireEvent.click(devicesBtn)
    })

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const el = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(el.type).toBe(PairedDevicesModalContent)
  })

  it('opens rename (edit) for the current vault from the context menu', async () => {
    render(<YourVaultsContent />)

    const rename = screen.getByTestId('settings-vault-edit-button')
    await act(async () => {
      fireEvent.click(rename)
    })

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const el = mockSetModal.mock.calls[0][0] as React.ReactElement<
      Record<string, unknown>
    >
    expect(el.type).toBe(CreateOrEditVaultModalContent)
    const editProps = el.props as {
      vault: { id: string; name: string }
      onClose: () => void
    }
    expect(editProps.vault).toEqual({
      id: 'vault-main',
      name: 'Main Vault'
    })
    expect(editProps.onClose).toBe(mockCloseModal)
  })
})
