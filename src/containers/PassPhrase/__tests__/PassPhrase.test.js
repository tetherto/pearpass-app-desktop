import React from 'react'
import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { PassPhrase } from '../'

// i18n returns key
jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s) => s } })
}))

// Styles
jest.mock('../styles', () => ({
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  PassPhraseHeader: ({ children }) => (
    <div data-testid="header">{children}</div>
  ),
  HeaderText: ({ children }) => <h1 data-testid="title">{children}</h1>,
  CopyPasteButton: ({ children, onClick, type }) => (
    <button data-testid="copy-paste" onClick={onClick} type={type}>
      {children}
    </button>
  ),
  CopyPasteText: ({ children }) => (
    <span data-testid="copy-paste-text">{children}</span>
  ),
  PassPhraseContainer: ({ children }) => (
    <div data-testid="words">{children}</div>
  ),
  ErrorContainer: ({ children }) => (
    <div data-testid="error-container">{children}</div>
  ),
  ErrorText: ({ children }) => <div data-testid="error-text">{children}</div>
}))
// Icons and shared components
jest.mock('../../../lib-react-components', () => ({
  CopyIcon: () => <i data-testid="copy-icon" />,
  PasteIcon: () => <i data-testid="paste-icon" />,
  PassPhraseIcon: () => <i data-testid="pp-icon" />,
  ErrorIcon: () => <i data-testid="error-icon" />
}))

// Badge item capture
const mockBadgeCalls = []
jest.mock('../../../components/BadgeTextItem', () => ({
  BadgeTextItem: (props) => {
    mockBadgeCalls.push(props)
    return (
      <div data-testid="badge-item">
        #{props.count}:{props.word}
      </div>
    )
  }
}))

// PassPhraseSettings capture
const mockSettingsCalls = []
jest.mock('../PassPhraseSettings', () => ({
  PassPhraseSettings: (props) => {
    mockSettingsCalls.push(props)
    return <div data-testid="settings" />
  }
}))

// Hooks
const mockCopy = jest.fn()
jest.mock('../../../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: mockCopy })
}))

const mockPaste = jest.fn()
jest.mock('../../../hooks/usePasteFromClipboard', () => ({
  usePasteFromClipboard: () => ({ pasteFromClipboard: mockPaste })
}))

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ setToast: jest.fn() })
}))

describe('PassPhrase (container)', () => {
  const renderComponent = (props = {}) =>
    render(
      <ThemeProvider>
        <PassPhrase
          isCreateOrEdit={false}
          onChange={jest.fn()}
          value=""
          error=""
          {...props}
        />
      </ThemeProvider>
    )

  beforeEach(() => {
    mockBadgeCalls.length = 0
    mockSettingsCalls.length = 0
    mockCopy.mockReset()
    mockPaste.mockReset()
  })

  test('renders header and no words initially', () => {
    renderComponent()
    expect(screen.getByTestId('pp-icon')).toBeInTheDocument()
    expect(screen.getByTestId('title')).toHaveTextContent('PassPhrase')
    expect(screen.getByTestId('words').children.length).toBe(0)
  })

  test('renders BadgeTextItem for each word in value', () => {
    renderComponent({ value: 'alpha@ !beta ,.gamma' })
    expect(screen.getAllByTestId('badge-item')).toHaveLength(3)
    expect(mockBadgeCalls.map((c) => c.word)).toEqual([
      'alpha@',
      '!beta',
      ',.gamma'
    ])
    expect(mockBadgeCalls.map((c) => c.count)).toEqual([1, 2, 3])
  })

  test('copy button copies when not create/edit', () => {
    renderComponent({ value: 'one two' })
    fireEvent.click(screen.getByTestId('copy-paste'))
    expect(mockCopy).toHaveBeenCalledWith('one two')
  })

  test('paste button pastes, updates list, and calls onChange in create/edit', async () => {
    const onChange = jest.fn()
    const value =
      'fo1o-1bar-3bam,.z-q#ux-quux-corge-gra.!ult-garpl&&!@y-waldo-!red-pl@ugh-%@xyzzy'
    mockPaste.mockResolvedValueOnce(value) // 12 words
    renderComponent({ isCreateOrEdit: true, onChange, value: '' })

    fireEvent.click(screen.getByTestId('copy-paste'))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(value))
    expect(mockPaste).toHaveBeenCalledTimes(1)
    // After paste we should have badges for words

    const splittedVal = value.split('-')
    expect(mockBadgeCalls.length).toBe(splittedVal.length)
    mockBadgeCalls.forEach((c) => {
      expect(c.word).toBe(splittedVal[c.count - 1])
    })
  })

  test('renders settings in create/edit, disabled when words present', async () => {
    mockPaste.mockResolvedValueOnce('a b c d e f g h i j k l') // 12 words
    renderComponent({ isCreateOrEdit: true })

    // Initially with zero words: settings shown and not disabled
    expect(screen.getByTestId('settings')).toBeInTheDocument()
    expect(mockSettingsCalls[0].isDisabled).toBe(false)

    fireEvent.click(screen.getByTestId('copy-paste'))
    await waitFor(() => expect(mockBadgeCalls.length).toBe(12))

    const lastSettings = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(lastSettings.isDisabled).toBe(true)
  })

  test('shows error text when error prop is provided', () => {
    renderComponent({ error: 'Oops!' })
    expect(screen.getByTestId('error-text')).toHaveTextContent('Oops!')
  })

  test('13 words: switch is on and radio selected to 12', () => {
    const thirteen =
      'one two three four five six seven eight nine ten eleven twelve rand'
    renderComponent({ isCreateOrEdit: true, value: thirteen })

    // Last settings props reflect current state
    const last = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(last.withRandomWord).toBe(true)
    expect(last.selectedType).toBe(12)
  })

  test('25 words: switch is on and radio selected to 24', () => {
    const twentyFive = 'a-b-c-d-!-@-g-h-i-j-k-l-(-)-o-p-q-r-s-3-u-v-w-x-y'

    renderComponent({ isCreateOrEdit: true, value: twentyFive })

    const last = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(last.withRandomWord).toBe(true)
    expect(last.selectedType).toBe(24)
  })

  test('after paste: settings are disabled', async () => {
    mockPaste.mockResolvedValueOnce(
      'one two three four five six seven eight nine ten eleven twelve'
    )
    renderComponent({ isCreateOrEdit: true })
    fireEvent.click(screen.getByTestId('copy-paste'))
    await waitFor(() => expect(mockBadgeCalls.length).toBe(12))
    const last = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(last.isDisabled).toBe(true)
  })
})
