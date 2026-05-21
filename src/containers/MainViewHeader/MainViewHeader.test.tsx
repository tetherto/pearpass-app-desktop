import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { SORT_KEYS } from '../../constants/sortOptions'

let mockRouterData: Record<string, unknown> = {}

jest.mock('../../context/RouterContext', () => ({
  useRouter: () => ({ data: mockRouterData })
}))

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock('../../hooks/useRecordMenuItems', () => ({
  ALL_ITEMS_TYPE: 'all',
  useRecordMenuItems: () => ({
    categoriesItems: [
      { type: 'all', label: 'All Items' },
      { type: 'login', label: 'Logins' }
    ]
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const React = require('react')
  return {
    useTheme: () => ({
      theme: {
        colors: {
          colorTextPrimary: '#fff',
          colorBorderPrimary: '#222',
          colorSurfacePrimary: '#000'
        }
      }
    }),
    rawTokens: new Proxy({}, { get: () => 0 }),
    Breadcrumb: ({
      items,
      actions
    }: {
      items: string[]
      actions?: React.ReactNode
    }) =>
      React.createElement(
        'nav',
        { 'data-testid': 'breadcrumb' },
        [
          React.createElement(
            'span',
            { key: 'items', 'data-testid': 'breadcrumb-items' },
            items.join(' > ')
          ),
          actions
        ]
      ),
    Button: ({
      children,
      onClick,
      disabled,
      ...rest
    }: {
      children?: React.ReactNode
      onClick?: () => void
      disabled?: boolean
      [key: string]: unknown
    }) =>
      React.createElement(
        'button',
        { type: 'button', onClick, disabled, ...rest },
        children
      ),
    ContextMenu: ({
      trigger,
      children,
      open
    }: {
      trigger: React.ReactNode
      children: React.ReactNode
      open?: boolean
    }) =>
      React.createElement('div', { 'data-testid': 'context-menu' }, [
        React.createElement('div', { key: 'trigger' }, trigger),
        open
          ? React.createElement('div', { key: 'menu', role: 'menu' }, children)
          : null
      ]),
    NavbarListItem: ({
      label,
      onClick,
      testID
    }: {
      label?: string
      onClick?: () => void
      testID?: string
    }) =>
      React.createElement(
        'button',
        { type: 'button', 'data-testid': testID, onClick },
        label
      )
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => {
  const React = require('react')
  const Icon = (name: string) => () =>
    React.createElement('span', { 'data-icon': name })
  return {
    CalendarToday: Icon('CalendarToday'),
    Check: Icon('Check'),
    Checklist: Icon('Checklist'),
    FilterList: Icon('FilterList'),
    SortByAlpha: Icon('SortByAlpha')
  }
})

import { MainViewHeader } from './MainViewHeader'

describe('MainViewHeader', () => {
  const baseProps = {
    sortKey: SORT_KEYS.LAST_UPDATED_NEWEST,
    setSortKey: jest.fn(),
    isMultiSelectOn: false,
    setIsMultiSelectOn: jest.fn()
  }

  beforeEach(() => {
    mockRouterData = {}
    jest.clearAllMocks()
  })

  it('renders the breadcrumb, select and sort controls', () => {
    render(<MainViewHeader {...baseProps} />)
    expect(screen.getByTestId('breadcrumb-items').textContent).toBe(
      'All Items > All Folders'
    )
    expect(screen.getByTestId('main-view-header-select')).toBeInTheDocument()
    expect(screen.getByTestId('main-view-header-sort')).toBeInTheDocument()
  })

  it('toggles multi-select via the select button', () => {
    const setIsMultiSelectOn = jest.fn()
    render(
      <MainViewHeader
        {...baseProps}
        setIsMultiSelectOn={setIsMultiSelectOn}
      />
    )
    fireEvent.click(screen.getByTestId('main-view-header-select'))
    expect(setIsMultiSelectOn).toHaveBeenCalledWith(true)
  })

  it('deactivates multi-select when already active and the select button is clicked', () => {
    const setIsMultiSelectOn = jest.fn()
    render(
      <MainViewHeader
        {...baseProps}
        isMultiSelectOn
        setIsMultiSelectOn={setIsMultiSelectOn}
      />
    )
    fireEvent.click(screen.getByTestId('main-view-header-select'))
    expect(setIsMultiSelectOn).toHaveBeenCalledWith(false)
  })

  it('reflects router data in the breadcrumb', () => {
    mockRouterData = { recordType: 'login', folder: 'Work' }
    render(<MainViewHeader {...baseProps} />)
    expect(screen.getByTestId('breadcrumb-items').textContent).toBe(
      'Logins > Work'
    )
  })
})
