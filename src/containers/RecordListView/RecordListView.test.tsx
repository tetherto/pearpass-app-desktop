import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import type { RecordSection } from '../../utils/groupRecordsByTimePeriod'

const mockNavigate = jest.fn()
let mockRouterData: Record<string, unknown> = {}

jest.mock('../../context/RouterContext', () => ({
  useRouter: () => ({
    currentPage: 'vault',
    data: mockRouterData,
    navigate: (...args: unknown[]) => mockNavigate(...args)
  })
}))

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock('../../components/RecordItemIcon', () => {
  const React = require('react')
  return {
    RecordItemIcon: ({ record }: { record: { id: string } }) =>
      React.createElement('div', {
        'data-testid': `record-icon-${record.id}`
      })
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const React = require('react')
  return {
    useTheme: () => ({
      theme: {
        colors: {
          colorTextSecondary: '#888',
          colorSurfaceDestructiveElevated: '#f00',
          colorBorderPrimary: '#222',
          colorSurfacePrimary: '#000'
        }
      }
    }),
    rawTokens: new Proxy({}, { get: () => 0 }),
    ListItem: ({
      title,
      subtitle,
      onClick,
      testID,
      isSelected,
      selectionMode,
      rightElement
    }: {
      title: string
      subtitle?: string
      onClick?: () => void
      testID?: string
      isSelected?: boolean
      selectionMode?: string
      rightElement?: React.ReactNode
    }) =>
      React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': testID,
          'data-selected': isSelected ? 'true' : 'false',
          'data-selection-mode': selectionMode,
          onClick
        },
        [
          React.createElement('span', { key: 'title' }, title),
          subtitle
            ? React.createElement('span', { key: 'subtitle' }, subtitle)
            : null,
          rightElement
            ? React.createElement(
                'div',
                { key: 'right', 'data-testid': `${testID}-right` },
                rightElement
              )
            : null
        ]
      )
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => {
  const React = require('react')
  const Stub = (name: string) =>
    React.forwardRef((_: Record<string, unknown>, _ref: unknown) =>
      React.createElement('span', { 'data-icon': name })
    )
  return {
    ExpandMore: Stub('ExpandMore'),
    StarFilled: Stub('StarFilled'),
    ErrorFilled: Stub('ErrorFilled')
  }
})

jest.mock('./RecordRowContextMenu', () => {
  return {
    RecordRowContextMenu: () => null
  }
})

import { RecordListView } from './RecordListView'

const makeSection = (
  key: string,
  titles: string[],
  extras?: Partial<RecordSection>
): RecordSection => ({
  key,
  title: key,
  data: titles.map((title, i) => ({
    id: `${key}-${i}`,
    type: 'login',
    data: { title, username: `${title.toLowerCase()}@example.com` }
  })),
  ...extras
})

describe('RecordListView', () => {
  beforeEach(() => {
    mockRouterData = {}
    mockNavigate.mockReset()
  })

  it('renders sections with titles translated and rows per record', () => {
    const sections: RecordSection[] = [
      makeSection('favorites', ['Fav One'], { isFavorites: true }),
      makeSection('today', ['Today Item'])
    ]
    render(<RecordListView sections={sections} />)

    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Fav One')).toBeInTheDocument()
    expect(screen.getByText('Today Item')).toBeInTheDocument()
  })

  it('collapses a section when its header is clicked', () => {
    const sections: RecordSection[] = [makeSection('today', ['Row'])]
    render(<RecordListView sections={sections} />)

    expect(screen.getByText('Row')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('record-list-section-today'))
    expect(screen.queryByText('Row')).not.toBeInTheDocument()
  })

  it('navigates to record details on row click when not in multi-select', () => {
    mockRouterData = { recordType: 'login' }
    const sections: RecordSection[] = [makeSection('today', ['Row'])]
    render(<RecordListView sections={sections} />)

    fireEvent.click(screen.getByTestId('record-list-item-today-0'))
    expect(mockNavigate).toHaveBeenCalledWith('vault', {
      recordId: 'today-0',
      recordType: 'login'
    })
  })

  it('toggles selection instead of navigating when multi-select is on', () => {
    const setSelectedRecords = jest.fn()
    const sections: RecordSection[] = [makeSection('today', ['Row A', 'Row B'])]
    render(
      <RecordListView
        sections={sections}
        isMultiSelectOn
        selectedRecords={['today-0']}
        setSelectedRecords={setSelectedRecords}
      />
    )

    fireEvent.click(screen.getByTestId('record-list-item-today-1'))
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(setSelectedRecords).toHaveBeenCalledTimes(1)
    const updater = setSelectedRecords.mock.calls[0][0] as (
      prev: string[]
    ) => string[]
    expect(updater(['today-0'])).toEqual(['today-0', 'today-1'])
    expect(updater(['today-0', 'today-1'])).toEqual(['today-0'])
  })

  it('renders a divider between each pair of sections but not after the last', () => {
    const sections: RecordSection[] = [
      makeSection('today', ['A']),
      makeSection('yesterday', ['B']),
      makeSection('older', ['C'])
    ]
    render(<RecordListView sections={sections} />)
    expect(screen.getAllByRole('separator')).toHaveLength(2)
    expect(screen.getByTestId('record-list-divider-today')).toBeInTheDocument()
    expect(
      screen.getByTestId('record-list-divider-yesterday')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('record-list-divider-older')
    ).not.toBeInTheDocument()
  })
})
