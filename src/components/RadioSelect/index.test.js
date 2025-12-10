import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { RadioSelect } from './index'
import '@testing-library/jest-dom'

jest.mock('./styles', () => ({
  RadioSelectWrapper: ({ children }) => (
    <div data-testid="radio-select-wrapper">{children}</div>
  ),
  Title: ({ children }) => <div data-testid="title">{children}</div>,
  RadioOption: ({ children, onClick }) => (
    <div data-testid="radio-option" onClick={onClick}>
      {children}
    </div>
  )
}))

jest.mock('../../lib-react-components', () => ({
  ButtonRadio: ({ isActive }) => (
    <div data-testid="button-radio" data-active={isActive ? 'true' : 'false'}>
      {isActive ? 'Active' : 'Inactive'}
    </div>
  )
}))

describe('RadioSelect', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ]
  const mockTitle = 'Select an option'
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  const renderComponent = (props = {}) =>
    render(
      <ThemeProvider>
        <RadioSelect
          title={mockTitle}
          options={mockOptions}
          selectedOption="option1"
          onChange={mockOnChange}
          {...props}
        />
      </ThemeProvider>
    )

  test('renders the component with title and options', () => {
    const { container } = renderComponent()
    expect(screen.getByTestId('title')).toHaveTextContent(mockTitle)
    expect(screen.getAllByTestId('radio-option')).toHaveLength(3)
    expect(container).toMatchSnapshot()
  })

  test('correctly marks the selected option', () => {
    renderComponent({ selectedOption: 'option2' })
    const radioButtons = screen.getAllByTestId('button-radio')

    expect(radioButtons[0]).toHaveAttribute('data-active', 'false')
    expect(radioButtons[1]).toHaveAttribute('data-active', 'true')
    expect(radioButtons[2]).toHaveAttribute('data-active', 'false')
  })

  test('calls onChange when an option is clicked', () => {
    renderComponent()

    const radioOptions = screen.getAllByTestId('radio-option')
    fireEvent.click(radioOptions[1])

    expect(mockOnChange).toHaveBeenCalledWith('option2')
  })

  test('renders all option labels correctly', () => {
    renderComponent()

    const radioOptions = screen.getAllByTestId('radio-option')
    expect(radioOptions[0]).toHaveTextContent('Option 1')
    expect(radioOptions[1]).toHaveTextContent('Option 2')
    expect(radioOptions[2]).toHaveTextContent('Option 3')
  })

  test('handles empty options array', () => {
    renderComponent({ options: [] })
    expect(screen.queryAllByTestId('radio-option')).toHaveLength(0)
  })

  test('maintains selection state between renders', () => {
    const { rerender } = renderComponent({ selectedOption: 'option1' })

    expect(screen.getAllByTestId('button-radio')[0]).toHaveAttribute(
      'data-active',
      'true'
    )

    rerender(
      <ThemeProvider>
        <RadioSelect
          title={mockTitle}
          options={mockOptions}
          selectedOption="option3"
          onChange={mockOnChange}
        />
      </ThemeProvider>
    )

    expect(screen.getAllByTestId('button-radio')[2]).toHaveAttribute(
      'data-active',
      'true'
    )
  })
})
