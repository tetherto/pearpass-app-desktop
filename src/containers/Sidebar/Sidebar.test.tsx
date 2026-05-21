import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockNavigate = jest.fn()
const mockCloseAllInstances = jest.fn()
const mockResetState = jest.fn()
const mockSetIsLoading = jest.fn()
const mockDeleteFolder = jest.fn()
const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()

let mockRouterData: Record<string, unknown> = {}
let mockFoldersData: {
  customFolders: Record<
    string,
    { name: string; records: Array<{ data?: unknown }> }
  >
  favorites: { records: unknown[] }
} = { customFolders: {}, favorites: { records: [] } }

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  AUTHENTICATOR_ENABLED: false
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  RECORD_TYPES: {
    LOGIN: 'login',
    IDENTITY: 'identity',
    CREDIT_CARD: 'credit_card',
    NOTE: 'note',
    CUSTOM: 'custom',
    WIFI_PASSWORD: 'wifi_password',
    PASS_PHRASE: 'pass_phrase'
  },
  closeAllInstances: (...args: unknown[]) => mockCloseAllInstances(...args),
  useFolders: () => ({
    data: mockFoldersData,
    deleteFolder: mockDeleteFolder
  }),
  useRecordCountsByType: () => ({ data: {} }),
  useVault: () => ({ data: { name: 'Test Vault' } }),
  useVaults: () => ({ resetState: mockResetState })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const React = require('react')
  return {
    useTheme: () => ({ theme: { colors: {} } }),
    rawTokens: new Proxy({}, { get: () => 0 }),
    Button: ({ onClick, 'data-testid': dataTestId, 'aria-label': ariaLabel }: {
      onClick?: () => void
      'data-testid'?: string
      'aria-label'?: string
    }) =>
      React.createElement('button', {
        type: 'button',
        'data-testid': dataTestId,
        'aria-label': ariaLabel,
        onClick
      }),
    NavbarListItem: ({
      label,
      onClick,
      onContextMenu,
      testID
    }: {
      label?: string
      onClick?: (e: React.MouseEvent) => void
      onContextMenu?: (e: React.MouseEvent) => void
      testID?: string
    }) =>
      React.createElement(
        'button',
        { type: 'button', 'data-testid': testID, onClick, onContextMenu },
        label
      ),
    ContextMenu: ({
      open,
      children,
      testID
    }: {
      open?: boolean
      children?: React.ReactNode
      testID?: string
    }) =>
      open
        ? React.createElement(
            'div',
            { role: 'menu', 'data-testid': testID },
            children
          )
        : null,
    Text: ({ children }: { children: React.ReactNode }) =>
      React.createElement('span', null, children)
  }
})

jest.mock(
  '@tetherto/pearpass-lib-ui-kit/components/Pressable',
  () => {
    const React = require('react')
    return {
      Pressable: ({
        children,
        onClick,
        'data-testid': dataTestId
      }: {
        children: React.ReactNode
        onClick?: () => void
        'data-testid'?: string
      }) =>
        React.createElement(
          'button',
          { type: 'button', 'data-testid': dataTestId, onClick },
          children
        )
    }
  },
  { virtual: true }
)

const iconStub = () => null

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: iconStub,
  Close: iconStub,
  CreateNewFolder: iconStub,
  EditOutlined: iconStub,
  ExpandMore: iconStub,
  Folder: iconStub,
  FolderCopy: iconStub,
  Layers: iconStub,
  LockFilled: iconStub,
  LockOutlined: iconStub,
  MenuOpen: iconStub,
  SettingsOutlined: iconStub,
  StarBorder: iconStub,
  StarFilled: iconStub,
  TrashOutlined: iconStub,
  TwoFactorAuthenticationOutlined: iconStub,
  AccountCircleFilled: iconStub,
  AccountCircleOutlined: iconStub,
  AssignmentInd: iconStub,
  CreditCard: iconStub,
  FormatQuote: iconStub,
  GridView: iconStub,
  LayerFilled: iconStub,
  Note: iconStub,
  WiFi: iconStub
}))

jest.mock('../../context/RouterContext', () => ({
  useRouter: () => ({ navigate: mockNavigate, data: mockRouterData })
}))

jest.mock('../../context/ModalContext', () => ({
  useModal: () => ({ setModal: mockSetModal, closeModal: mockCloseModal })
}))

jest.mock('../../context/LoadingContext', () => ({
  useLoadingContext: () => ({ setIsLoading: mockSetIsLoading })
}))

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (s: string) => s })
}))

jest.mock('../Modal/CreateFolderModalContent/CreateFolderModalContent', () => {
  const React = require('react')
  return {
    CreateFolderModalContent: (props: { initialValues?: { title: string } }) =>
      React.createElement('div', {
        'data-testid': 'mock-create-folder-modal',
        'data-initial-title': props.initialValues?.title ?? ''
      })
  }
})

jest.mock('../Modal/DeleteFolderModalContent/DeleteFolderModalContent', () => {
  const React = require('react')
  return {
    DeleteFolderModalContent: (props: { folderName: string; count: number }) =>
      React.createElement('div', {
        'data-testid': 'mock-delete-folder-modal',
        'data-folder-name': props.folderName,
        'data-count': String(props.count)
      })
  }
})

import { Sidebar } from './Sidebar'

const makeFolder = (
  name: string,
  itemCount: number
): { name: string; records: Array<{ data?: unknown }> } => ({
  name,
  records: Array.from({ length: itemCount }, () => ({ data: {} }))
})

describe('Sidebar — lock app flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRouterData = {}
    mockFoldersData = { customFolders: {}, favorites: { records: [] } }
  })

  it('closes instances, navigates to master password, and resets vault state', async () => {
    mockCloseAllInstances.mockImplementation(() => Promise.resolve())

    render(<Sidebar />)

    fireEvent.click(screen.getByTestId('sidebar-lock-app'))

    await waitFor(() => {
      expect(mockCloseAllInstances).toHaveBeenCalledTimes(1)
    })
    expect(mockNavigate).toHaveBeenCalledWith('welcome', {
      state: 'masterPassword'
    })
    expect(mockResetState).toHaveBeenCalledTimes(1)
    expect(mockSetIsLoading).toHaveBeenNthCalledWith(1, true)
    expect(mockSetIsLoading).toHaveBeenLastCalledWith(false)
  })

  it('navigates to settings when Settings is clicked', async () => {
    render(<Sidebar />)

    fireEvent.click(screen.getByTestId('sidebar-settings-button'))

    expect(mockNavigate).toHaveBeenCalledWith('settings', {})
  })
})

describe('Sidebar — folder context menu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRouterData = {}
    mockFoldersData = {
      customFolders: {
        work: makeFolder('work', 2),
        empty: makeFolder('empty', 0),
        other: makeFolder('other', 1)
      },
      favorites: { records: [] }
    }
  })

  it('opens the menu with Rename and Delete on right-click', () => {
    render(<Sidebar />)

    expect(screen.queryByTestId('sidebar-folder-menu-work')).toBeNull()

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-work'))

    expect(screen.getByTestId('sidebar-folder-menu-work')).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-folder-menu-rename-work')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-folder-menu-delete-work')
    ).toBeInTheDocument()
  })

  it('Rename opens CreateFolderModalContent prefilled with the folder title', () => {
    render(<Sidebar />)

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-work'))
    fireEvent.click(screen.getByTestId('sidebar-folder-menu-rename-work'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const modal = mockSetModal.mock.calls[0][0] as React.ReactElement
    render(modal)
    const instance = screen.getByTestId('mock-create-folder-modal')
    expect(instance.getAttribute('data-initial-title')).toBe('work')
  })

  it('Delete on an empty folder calls deleteFolder directly (no modal)', () => {
    render(<Sidebar />)

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-empty'))
    fireEvent.click(screen.getByTestId('sidebar-folder-menu-delete-empty'))

    expect(mockDeleteFolder).toHaveBeenCalledWith('empty')
    expect(mockSetModal).not.toHaveBeenCalled()
  })

  it('Delete on an empty active folder navigates away to All Folders', () => {
    mockRouterData = { folder: 'empty', recordType: 'all' }
    render(<Sidebar />)

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-empty'))
    fireEvent.click(screen.getByTestId('sidebar-folder-menu-delete-empty'))

    expect(mockDeleteFolder).toHaveBeenCalledWith('empty')
    expect(mockNavigate).toHaveBeenCalledWith('vault', { recordType: 'all' })
  })

  it('Delete on a non-empty folder opens DeleteFolderModalContent with the item count', () => {
    render(<Sidebar />)

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-work'))
    fireEvent.click(screen.getByTestId('sidebar-folder-menu-delete-work'))

    expect(mockDeleteFolder).not.toHaveBeenCalled()
    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const modal = mockSetModal.mock.calls[0][0] as React.ReactElement
    render(modal)
    const instance = screen.getByTestId('mock-delete-folder-modal')
    expect(instance.getAttribute('data-folder-name')).toBe('work')
    expect(instance.getAttribute('data-count')).toBe('2')
  })

  it('opening one folder menu closes any other open menu', () => {
    render(<Sidebar />)

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-work'))
    expect(screen.getByTestId('sidebar-folder-menu-work')).toBeInTheDocument()

    fireEvent.contextMenu(screen.getByTestId('sidebar-folder-other'))
    expect(screen.getByTestId('sidebar-folder-menu-other')).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-folder-menu-work')).toBeNull()
  })
})
