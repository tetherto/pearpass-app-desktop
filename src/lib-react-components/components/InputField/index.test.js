import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { InputField } from './index'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'
import '@testing-library/jest-dom'

const DummyIcon = ArrowDownIcon

describe('InputField Component', () => {
  test('renders label, placeholder, and error message', () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemeProvider>
        <InputField
          value="test value"
          label="Test Label"
          placeholder="Enter text"
          error="Error occurred"
        />
      </ThemeProvider>
    )
    expect(getByText('Test Label')).toBeInTheDocument()
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    expect(getByText('Error occurred')).toBeInTheDocument()
  })

  test('calls onChange when input changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <InputField value="" placeholder="Enter text" onChange={handleChange} />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalledWith('new value')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <InputField
          value=""
          placeholder="Enter text"
          onChange={handleChange}
          isDisabled={true}
        />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'should not change' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('calls onClick when outer element is clicked and focuses input', () => {
    const handleClick = jest.fn()
    const { container, getByPlaceholderText } = render(
      <ThemeProvider>
        <InputField
          value="click test"
          placeholder="Enter text"
          onClick={handleClick}
        />
      </ThemeProvider>
    )
    const outerElement = container.firstChild
    fireEvent.click(outerElement)
    expect(handleClick).toHaveBeenCalledWith('click test')
    const input = getByPlaceholderText('Enter text')
    expect(document.activeElement).toBe(input)
  })

  test('renders overlay correctly: visible when not focused, hidden when focused', async () => {
    const overlayText = 'Overlay Content'
    const { queryByText, getByPlaceholderText } = render(
      <ThemeProvider>
        <InputField
          value="overlay test"
          placeholder="Enter text"
          overlay={overlayText}
        />
      </ThemeProvider>
    )
    expect(queryByText(overlayText)).toBeInTheDocument()

    const input = getByPlaceholderText('Enter text')
    fireEvent.focus(input)
    expect(queryByText(overlayText)).not.toBeInTheDocument()
  })

  test('renders icon if provided', () => {
    const { container } = render(
      <ThemeProvider>
        <InputField
          value="icon test"
          placeholder="Enter text"
          icon={DummyIcon}
        />
      </ThemeProvider>
    )
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  test('renders additionalItems if provided', () => {
    const additionalItemText = 'Additional'
    const { getByText } = render(
      <ThemeProvider>
        <InputField
          value="additional test"
          placeholder="Enter text"
          additionalItems={<div>{additionalItemText}</div>}
        />
      </ThemeProvider>
    )
    expect(getByText(additionalItemText)).toBeInTheDocument()
  })

  test('matches snapshot for default variant', () => {
    const { container } = render(
      <ThemeProvider>
        <InputField
          value="snapshot test"
          placeholder="Enter text"
          label="Label"
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot for outline variant', () => {
    const { container } = render(
      <ThemeProvider>
        <InputField
          value="outline snapshot"
          placeholder="Enter text"
          label="Outline Label"
          variant="outline"
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('autoFocus prop focuses input automatically', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <InputField value="autofocus test" placeholder="Enter text" autoFocus />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Enter text')
    expect(document.activeElement).toBe(input)
  })
})
