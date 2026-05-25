import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

let mockSearchValue = ''
let mockRecords = []

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  DESKTOP_DESIGN_VERSION: 2,
  DESKTOP_2FA_IMPORTS_ENABLED: true
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useRecords: () => ({
    data: mockRecords,
    updateFavoriteState: jest.fn()
  }),
  useFolders: () => ({ data: { customFolders: {} } }),
  formatOtpCode: (code) => (code ? code : ''),
  groupOtpRecords: (records) => {
    const totpGroups = []
    const hotpRecords = []
    const totpRecords = records.filter(
      (r) => r.otpPublic?.type === 'TOTP' || !r.otpPublic?.type
    )
    if (totpRecords.length) {
      totpGroups.push({
        period: 30,
        records: totpRecords
      })
    }
    return { totpGroups, hotpRecords }
  },
  isExpiring: () => false,
  OTP_TYPE: { TOTP: 'TOTP', HOTP: 'HOTP' },
  useTimerAnimation: () => ({
    noTransition: false,
    expiring: false,
    targetTime: 30
  }),
  useOtp: () => ({
    code: '',
    timeRemaining: null,
    type: 'TOTP',
    period: 30,
    generateNext: null,
    isLoading: false
  })
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (msg) => msg } })
}))

jest.mock('../../context/AppHeaderContext', () => ({
  useAppHeaderContext: () => ({
    searchValue: mockSearchValue,
    setSearchValue: jest.fn(),
    isAddMenuOpen: false,
    setIsAddMenuOpen: jest.fn()
  })
}))

jest.mock('../../context/RouterContext', () => ({
  useRouter: () => ({
    navigate: jest.fn(),
    data: {}
  })
}))

jest.mock('../../context/ModalContext', () => ({
  useModal: () => ({ setModal: jest.fn(), isOpen: false })
}))

jest.mock('../../hooks/useCreateOrEditRecord', () => ({
  useCreateOrEditRecord: () => ({ handleCreateOrEditRecord: jest.fn() })
}))

jest.mock('../../hooks/useCopyToClipboard.electron', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: jest.fn() })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const ReactInner = require('react')
  return {
    Breadcrumb: ({ items, actions }) =>
      ReactInner.createElement(
        'div',
        { 'data-testid': 'breadcrumb' },
        items.map((item, i) =>
          ReactInner.createElement(
            'span',
            { key: i, 'data-testid': `breadcrumb-item-${i}` },
            item
          )
        ),
        actions
      ),
    Button: ({
      children,
      onClick,
      'data-testid': testId,
      'aria-label': ariaLabel,
      'aria-pressed': ariaPressed,
      iconBefore
    }) =>
      ReactInner.createElement(
        'button',
        {
          type: 'button',
          'data-testid': testId,
          'aria-label': ariaLabel,
          'aria-pressed': ariaPressed,
          onClick
        },
        iconBefore,
        children
      ),
    ContextMenu: ({ trigger, children, open }) =>
      ReactInner.createElement(
        'div',
        { 'data-testid': 'context-menu' },
        trigger,
        open ? children : null
      ),
    ListItem: ({ title, onClick, testID, rightElement }) =>
      ReactInner.createElement(
        'div',
        { 'data-testid': testID, onClick },
        ReactInner.createElement('span', null, title),
        rightElement
      ),
    NavbarListItem: ({ label, onClick, testID }) =>
      ReactInner.createElement(
        'button',
        { type: 'button', 'data-testid': testID, onClick },
        label
      ),
    Text: ({ children }) => ReactInner.createElement('span', null, children),
    Title: ({ children }) => ReactInner.createElement('h2', null, children),
    useTheme: () => ({
      theme: {
        colors: {
          colorTextPrimary: '#fff',
          colorTextSecondary: '#aaa',
          colorTextDestructive: '#f00',
          colorPrimary: '#0f0',
          colorBorderPrimary: '#333',
          colorSurfacePrimary: '#000'
        }
      }
    }),
    rawTokens: new Proxy({}, { get: () => 0 })
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => {
  const ReactInner = require('react')
  const Stub = () => ReactInner.createElement('span')
  return {
    Add: Stub,
    CalendarToday: Stub,
    Check: Stub,
    Checklist: Stub,
    ContentCopy: Stub,
    FilterList: Stub,
    ImportExport: Stub,
    SortByAlpha: Stub
  }
})

jest.mock('../../components/RecordItemIcon', () => ({
  RecordItemIcon: () => null
}))

jest.mock('../../components/TimerCircle', () => ({
  TimerCircle: () => null
}))

jest.mock(
  '../../containers/EmptyCollectionView/EmptyCollectionView.styles',
  () => ({
    ILLUSTRATION_HEIGHT: 100,
    createStyles: () => ({
      container: {},
      content: {},
      illustration: {},
      textBlock: {},
      descriptionParagraph: {},
      ctas: {},
      ctaButton: {}
    })
  })
)

jest.mock('../../containers/RecordListView/RecordListView.styles', () => ({
  createStyles: () => ({
    wrapper: {},
    scrollArea: {},
    section: {},
    sectionList: {},
    sectionHeader: {},
    staticSectionHeader: {},
    recordRow: {},
    divider: {},
    rowRightElement: {}
  })
}))

jest.mock('../../containers/EmptyResultsView', () => ({
  EmptyResultsView: () => (
    <div data-testid="empty-results">No result found.</div>
  )
}))

jest.mock(
  '../../containers/Modal/MoveFolderModalContent/MoveFolderModalContent',
  () => ({
    MoveFolderModalContent: () => null
  })
)

jest.mock('../../containers/Modal/DeleteRecordsModalContent', () => ({
  DeleteRecordsModalContent: () => null
}))

jest.mock('../../containers/MultiSelectActionsBar', () => ({
  MultiSelectActionsBar: () => <div data-testid="multi-select-actions-bar" />
}))

jest.mock('../../pages/SettingsView/SettingsView', () => ({
  SettingsItemKey: { ImportItems: 'ImportItems' }
}))

jest.mock('../../svgs/ItemCardIllustration', () => ({
  ItemCardIllustration: () => null
}))

jest.mock('../../utils/getRecordSubtitle', () => ({
  getRecordSubtitle: () => ''
}))

import { AuthenticatorView } from './index'

describe('AuthenticatorView', () => {
  beforeEach(() => {
    mockSearchValue = ''
    mockRecords = []
  })

  test('renders empty state with Add/Import buttons when no records and no search', () => {
    render(<AuthenticatorView />)

    expect(screen.getByText('No codes saved')).toBeInTheDocument()
    expect(screen.getByTestId('authenticator-empty-state')).toBeInTheDocument()
    expect(
      screen.getByTestId('authenticator-empty-add-code')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('authenticator-empty-import-codes')
    ).toBeInTheDocument()
  })

  test('renders EmptyResultsView when search has no results', () => {
    mockSearchValue = 'no-match'

    render(<AuthenticatorView />)

    expect(screen.getByTestId('empty-results')).toBeInTheDocument()
    expect(screen.queryByText('No codes saved')).not.toBeInTheDocument()
  })

  test('renders authenticator record list when records exist', () => {
    mockRecords = [
      {
        id: 'rec-1',
        data: { title: 'Test Account' },
        otpPublic: {
          type: 'TOTP',
          digits: 6,
          period: 30,
          currentCode: '123456',
          timeRemaining: 20
        }
      }
    ]

    render(<AuthenticatorView />)

    expect(screen.getByTestId('authenticator-record-list')).toBeInTheDocument()
    expect(
      screen.getByTestId('authenticator-record-item-rec-1')
    ).toBeInTheDocument()
    expect(screen.getByText('Test Account')).toBeInTheDocument()
  })

  test('multi-select button toggles aria-pressed', () => {
    render(<AuthenticatorView />)

    const button = screen.getByTestId('authenticator-header-multi-select')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('shows multi-select actions bar when multi-select is on', () => {
    render(<AuthenticatorView />)

    expect(
      screen.queryByTestId('multi-select-actions-bar')
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('authenticator-header-multi-select'))

    expect(screen.getByTestId('multi-select-actions-bar')).toBeInTheDocument()
  })
})
