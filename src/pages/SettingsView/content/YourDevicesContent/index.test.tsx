/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { YourDevicesContent } from './index'
;(globalThis as { React?: typeof React }).React = React

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const mockToggleBrowserExtension = jest.fn()
let mockExtensionState = {
  isBrowserExtensionEnabled: false,
  toggleBrowserExtension: mockToggleBrowserExtension
}

jest.mock('../../../../hooks/useConnectExtension', () => ({
  useConnectExtension: () => mockExtensionState
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    sectionHeading: {},
    sectionCard: {},
    list: {},
    iconWrap: {},
    emptyBrowserStateWrap: {},
    emptyStateCaptions: {},
    emptyStateFooter: {}
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
    rightElement?: React.ReactNode
    [key: string]: unknown
  }) => (
    <div data-testid={props.testID}>
      <div>{props.title}</div>
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
  MoreVert: () => null,
  PhoneIphone: () => null,
  SwapVert: () => null
}))

describe('YourDevicesContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExtensionState = {
      isBrowserExtensionEnabled: false,
      toggleBrowserExtension: mockToggleBrowserExtension
    }
  })

  it('renders the page heading', () => {
    render(<YourDevicesContent />)

    expect(
      screen.getByRole('heading', { name: 'Your Devices' })
    ).toBeInTheDocument()
  })

  it('shows empty state when the browser extension is disabled', () => {
    render(<YourDevicesContent />)

    expect(screen.getByText('Browser Extension')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Create a unique pairing code to link your PearPass extension and enable autofill.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('Generate Pair Code for Browser Extension')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('settings-device-item-browser')
    ).not.toBeInTheDocument()
  })

  it('calls toggleBrowserExtension(true) when generate-pair-code button is clicked', () => {
    render(<YourDevicesContent />)

    fireEvent.click(
      screen.getByText('Generate Pair Code for Browser Extension')
    )

    expect(mockToggleBrowserExtension).toHaveBeenCalledTimes(1)
    expect(mockToggleBrowserExtension).toHaveBeenCalledWith(true)
  })

  it('shows browser device row when the extension is enabled', () => {
    mockExtensionState = {
      isBrowserExtensionEnabled: true,
      toggleBrowserExtension: mockToggleBrowserExtension
    }

    render(<YourDevicesContent />)

    expect(
      screen.getByTestId('settings-device-item-browser')
    ).toBeInTheDocument()
    expect(screen.getByText('Browser')).toBeInTheDocument()
    expect(
      screen.queryByText('Generate Pair Code for Browser Extension')
    ).not.toBeInTheDocument()
  })

  it('shows the extension actions button when the extension is enabled', () => {
    mockExtensionState = {
      isBrowserExtensionEnabled: true,
      toggleBrowserExtension: mockToggleBrowserExtension
    }

    render(<YourDevicesContent />)

    expect(
      screen.getByTestId('settings-browser-extension-action')
    ).toBeInTheDocument()
  })

  it('calls toggleBrowserExtension(false) when unpair is clicked', () => {
    mockExtensionState = {
      isBrowserExtensionEnabled: true,
      toggleBrowserExtension: mockToggleBrowserExtension
    }

    render(<YourDevicesContent />)

    fireEvent.click(screen.getByText('Unpair Browser extension'))

    expect(mockToggleBrowserExtension).toHaveBeenCalledTimes(1)
    expect(mockToggleBrowserExtension).toHaveBeenCalledWith(false)
  })
})
