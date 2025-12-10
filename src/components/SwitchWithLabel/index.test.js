import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import '@testing-library/jest-dom'
import { SwitchWithLabel } from './index'

jest.mock('../../lib-react-components', () => ({
  Switch: ({ isOn }) => (
    <div data-testid="switch" data-is-on={isOn}>
      Switch Component
    </div>
  )
}))

describe('SwitchWithLabel Component', () => {
  const defaultProps = {
    isOn: false,
    onChange: jest.fn(),
    label: 'Test Label',
    isLabelBold: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with default props', () => {
    const { container, getByText, getByTestId } = render(
      <ThemeProvider>
        <SwitchWithLabel {...defaultProps} />
      </ThemeProvider>
    )

    expect(getByText('Test Label')).toBeInTheDocument()
    expect(getByTestId('switch')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls onChange handler when clicked', () => {
    const { container } = render(
      <ThemeProvider>
        <SwitchWithLabel {...defaultProps} />
      </ThemeProvider>
    )

    fireEvent.click(container.firstChild)
    expect(defaultProps.onChange).toHaveBeenCalledWith(true)
  })

  test('toggles from on to off when clicked', () => {
    const props = {
      ...defaultProps,
      isOn: true
    }

    const { container } = render(
      <ThemeProvider>
        <SwitchWithLabel {...props} />
      </ThemeProvider>
    )

    fireEvent.click(container.firstChild)
    expect(props.onChange).toHaveBeenCalledWith(false)
  })

  test('renders switch with correct isOn state', () => {
    const props = {
      ...defaultProps,
      isOn: true
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <SwitchWithLabel {...props} />
      </ThemeProvider>
    )

    const switchComponent = getByTestId('switch')
    expect(switchComponent).toHaveAttribute('data-is-on', 'true')
  })

  test('does not throw when onChange is not provided', () => {
    const props = {
      ...defaultProps,
      onChange: undefined
    }

    const { container } = render(
      <ThemeProvider>
        <SwitchWithLabel {...props} />
      </ThemeProvider>
    )

    expect(() => {
      fireEvent.click(container.firstChild)
    }).not.toThrow()
  })
})
