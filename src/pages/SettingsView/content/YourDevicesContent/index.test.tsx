/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { YourDevicesContent } from './index'
;(globalThis as { React?: typeof React }).React = React

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string, values?: Record<string, unknown>) =>
      values
        ? str.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
        : str
  })
}))

jest.mock('@tetherto/pear-apps-utils-date', () => ({
  formatDate: () => '01/08/26'
}))

const mockAddBrowser = jest.fn()
const mockUnpairBrowser = jest.fn()
const mockDisableBrowserExtension = jest.fn()

let mockExtensionState = {
  isBrowserExtensionEnabled: false,
  addBrowser: mockAddBrowser,
  unpairBrowser: mockUnpairBrowser,
  disableBrowserExtension: mockDisableBrowserExtension
}

let mockBrowsers: Array<Record<string, string>> = []

jest.mock('../../../../hooks/useConnectExtension', () => ({
  useConnectExtension: () => mockExtensionState
}))

jest.mock('../../../../hooks/usePairedBrowsers', () => ({
  usePairedBrowsers: () => ({
    browsers: mockBrowsers,
    isLoading: false,
    refresh: jest.fn()
  })
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    sectionHeading: {},
    sectionCard: {},
    list: {},
    listItemBorder: {},
    footer: {},
    iconWrap: {},
    emptyBrowserStateWrap: {},
    emptyStateCaptions: {},
    emptyStateFooter: {},
    disableWrap: {}
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        colorTextSecondary: '#888',
        colorTextPrimary: '#fff',
        colorAccentActive: '#22a'
      }
    }
  }),
  PageHeader: ({
    title
  }: {
    title: React.ReactNode
    subtitle?: React.ReactNode
    as?: string
  }) => <h1>{title}</h1>,
  Text: ({
    children
  }: {
    children: React.ReactNode
    [key: string]: unknown
  }) => <div>{children}</div>,
  Button: (props: {
    children?: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
    'aria-label'?: string
    [key: string]: unknown
  }) => (
    <button
      type="button"
      data-testid={props['data-testid']}
      aria-label={props['aria-label']}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  ),
  ListItem: (props: {
    testID?: string
    title?: React.ReactNode
    subtitle?: React.ReactNode
    rightElement?: React.ReactNode
    [key: string]: unknown
  }) => (
    <div data-testid={props.testID}>
      <div>{props.title}</div>
      <div>{props.subtitle}</div>
      {props.rightElement}
    </div>
  ),
  ContextMenu: ({
    children,
    trigger
  }: {
    children: React.ReactNode
    trigger: React.ReactNode
    [key: string]: unknown
  }) => (
    <div>
      {trigger}
      {children}
    </div>
  ),
  NavbarListItem: (props: {
    label: string
    onClick?: () => void
    [key: string]: unknown
  }) => (
    <button type="button" onClick={props.onClick}>
      {props.label}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: () => null,
  MoreVert: () => null,
  PublicOutlined: () => null,
  SwapVert: () => null
}))

const CHROME = {
  publicKey: 'chromeKey',
  label: 'Chrome — work laptop',
  pairingState: 'CONFIRMED',
  pairedAt: '2026-08-01T00:00:00.000Z'
}

const FIREFOX = {
  publicKey: 'firefoxKey',
  label: 'Firefox',
  pairingState: 'CONFIRMED',
  pairedAt: '2026-08-02T00:00:00.000Z'
}

describe('YourDevicesContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBrowsers = []
    mockExtensionState = {
      isBrowserExtensionEnabled: false,
      addBrowser: mockAddBrowser,
      unpairBrowser: mockUnpairBrowser,
      disableBrowserExtension: mockDisableBrowserExtension
    }
  })

  it('renders the page heading', () => {
    render(<YourDevicesContent />)

    expect(
      screen.getByRole('heading', { name: 'Your Devices' })
    ).toBeInTheDocument()
  })

  it('shows empty state when no browser is paired', () => {
    render(<YourDevicesContent />)

    expect(screen.getByText('Browser Extension')).toBeInTheDocument()
    expect(
      screen.getByText('Generate Pair Code for Browser Extension')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('settings-device-item-0')).not.toBeInTheDocument()
  })

  it('calls addBrowser from the empty state', () => {
    render(<YourDevicesContent />)

    fireEvent.click(screen.getByText('Generate Pair Code for Browser Extension'))

    expect(mockAddBrowser).toHaveBeenCalledTimes(1)
  })

  it('renders a row per paired browser', () => {
    mockBrowsers = [CHROME, FIREFOX]

    render(<YourDevicesContent />)

    expect(screen.getByTestId('settings-device-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('settings-device-item-1')).toBeInTheDocument()
    expect(screen.getByText('Chrome — work laptop')).toBeInTheDocument()
    expect(screen.getByText('Firefox')).toBeInTheDocument()
    // Both rows carry a pairing date (the formatter is stubbed to one value)
    expect(screen.getAllByText('Paired on 01/08/26')).toHaveLength(2)
  })

  it('shows a pending browser as awaiting confirmation', () => {
    mockBrowsers = [{ ...CHROME, pairingState: 'PENDING' }]

    render(<YourDevicesContent />)

    expect(
      screen.getByText('Waiting for the browser to confirm…')
    ).toBeInTheDocument()
  })

  it('offers to add another browser once one is paired', () => {
    mockBrowsers = [CHROME]

    render(<YourDevicesContent />)

    fireEvent.click(screen.getByTestId('settings-browser-extension-add'))

    expect(mockAddBrowser).toHaveBeenCalledTimes(1)
  })

  it('unpairs only the chosen browser', () => {
    mockBrowsers = [CHROME, FIREFOX]

    render(<YourDevicesContent />)

    fireEvent.click(screen.getByText('Unpair Firefox'))

    expect(mockUnpairBrowser).toHaveBeenCalledTimes(1)
    expect(mockUnpairBrowser).toHaveBeenCalledWith('firefoxKey')
  })

  it('hides the global off-switch while the integration is off', () => {
    mockBrowsers = [CHROME]

    render(<YourDevicesContent />)

    expect(
      screen.queryByTestId('settings-browser-extension-disable')
    ).not.toBeInTheDocument()
  })

  it('turns the whole integration off from the section control', () => {
    mockBrowsers = [CHROME]
    mockExtensionState = {
      ...mockExtensionState,
      isBrowserExtensionEnabled: true
    }

    render(<YourDevicesContent />)

    fireEvent.click(screen.getByTestId('settings-browser-extension-disable'))

    expect(mockDisableBrowserExtension).toHaveBeenCalledTimes(1)
    expect(mockUnpairBrowser).not.toHaveBeenCalled()
  })
})
