import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { PASSPHRASE_WORD_COUNTS } from 'pearpass-lib-constants'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import '@testing-library/jest-dom'

import { PassPhraseSettings } from '../PassPhraseSettings'

jest.mock('../styles', () => ({
  PassPraseSettingsContainer: ({ children }) => (
    <div data-testid="settings-container">{children}</div>
  ),
  PassPraseSettingsRandomWordContainer: ({ children }) => (
    <div data-testid="random-word-container">{children}</div>
  ),
  PassPraseSettingsRandomWordText: ({ children }) => (
    <div data-testid="random-word-text">{children}</div>
  ),
  SwitchWrapper: ({ children }) => (
    <div data-testid="switch-wrapper">{children}</div>
  )
}))

// Mock i18n to return the key itself
jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s) => s } })
}))

// Capture props passed into children
const mockRadioSelectSpy = jest.fn()
const mockSwitchWithLabelSpy = jest.fn()

jest.mock('../../../components/RadioSelect', () => ({
  RadioSelect: (props) => {
    mockRadioSelectSpy(props)
    return (
      <button data-testid="radio-select" onClick={() => props.onChange(24)}>
        {props.title}
      </button>
    )
  }
}))

jest.mock('../../../components/SwitchWithLabel', () => ({
  SwitchWithLabel: (props) => {
    mockSwitchWithLabelSpy(props)
    return (
      <button
        data-testid="switch-with-label"
        onClick={() => props.onChange(true)}
        disabled={props.disabled}
      >
        toggle
      </button>
    )
  }
}))

describe('PassPhraseSettings', () => {
  const renderComponent = (overrideProps = {}) => {
    const defaultProps = {
      selectedType: PASSPHRASE_WORD_COUNTS.STANDARD_12,
      setSelectedType: jest.fn(),
      withRandomWord: false,
      setWithRandomWord: jest.fn(),
      isDisabled: false
    }

    const props = { ...defaultProps, ...overrideProps }

    const utils = render(
      <ThemeProvider>
        <PassPhraseSettings {...props} />
      </ThemeProvider>
    )

    return { ...utils, props }
  }

  beforeEach(() => {
    mockRadioSelectSpy.mockClear()
    mockSwitchWithLabelSpy.mockClear()
  })

  test('renders and passes correct props to RadioSelect', () => {
    const { props } = renderComponent()

    const radio = screen.getByTestId('radio-select')
    expect(radio).toBeInTheDocument()
    expect(radio).toHaveTextContent('Type')

    const passed = mockRadioSelectSpy.mock.calls[0][0]
    expect(passed.selectedOption).toBe(props.selectedType)
    expect(passed.disabled).toBe(false)
    expect(passed.options.map((o) => o.value)).toEqual([
      PASSPHRASE_WORD_COUNTS.STANDARD_12,
      PASSPHRASE_WORD_COUNTS.STANDARD_24
    ])
    expect(passed.options.map((o) => o.label)).toEqual([
      `${PASSPHRASE_WORD_COUNTS.STANDARD_12} words`,
      `${PASSPHRASE_WORD_COUNTS.STANDARD_24} words`
    ])
  })

  test('invokes setSelectedType when RadioSelect triggers onChange', () => {
    const { props } = renderComponent()

    fireEvent.click(screen.getByTestId('radio-select'))
    expect(props.setSelectedType).toHaveBeenCalledWith(
      PASSPHRASE_WORD_COUNTS.STANDARD_24
    )
  })

  test('renders and toggles SwitchWithLabel', () => {
    const { props } = renderComponent({ withRandomWord: false })

    const passed = mockSwitchWithLabelSpy.mock.calls[0][0]
    expect(passed.isOn).toBe(false)
    expect(passed.disabled).toBe(false)

    fireEvent.click(screen.getByTestId('switch-with-label'))
    expect(props.setWithRandomWord).toHaveBeenCalledWith(true)
  })

  test('forwards disabled to children', () => {
    renderComponent({ isDisabled: true })

    const radioProps = mockRadioSelectSpy.mock.calls[0][0]
    const switchProps = mockSwitchWithLabelSpy.mock.calls[0][0]
    expect(radioProps.disabled).toBe(true)
    expect(switchProps.disabled).toBe(true)
  })
})
