import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ExpandMore as DummyIcon } from '@tetherto/pearpass-lib-ui-kit/icons'

import { InputField } from './index'
import '@testing-library/jest-dom'

describe('InputField Component', () => {
  test('renders label, placeholder, and error message', () => {
    const { getByText, getByPlaceholderText } = render(
      <InputField
        value="test value"
        label="Test Label"
        placeholder="Enter text"
        error="Error occurred"
      />
    )
    expect(getByText('Test Label')).toBeInTheDocument()
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    expect(getByText('Error occurred')).toBeInTheDocument()
  })

  test('calls onChange when input changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = render(
      <InputField value="" placeholder="Enter text" onChange={handleChange} />
    )
    const input = getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalledWith('new value')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = render(
      <InputField
        value=""
        placeholder="Enter text"
        onChange={handleChange}
        isDisabled={true}
      />
    )
    const input = getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'should not change' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('calls onClick when outer element is clicked and focuses input', () => {
    const handleClick = jest.fn()
    const { getByPlaceholderText } = render(
      <InputField
        value="click test"
        placeholder="Enter text"
        onClick={handleClick}
      />
    )
    const input = getByPlaceholderText('Enter text')
    const outerElement = input.closest('div')
    fireEvent.click(outerElement)
    expect(handleClick).toHaveBeenCalledWith('click test')
    expect(document.activeElement).toBe(input)
  })

  test('renders overlay correctly: visible when not focused, hidden when focused', async () => {
    const overlayText = 'Overlay Content'
    const { queryByText, getByPlaceholderText } = render(
      <InputField
        value="overlay test"
        placeholder="Enter text"
        overlay={overlayText}
      />
    )
    expect(queryByText(overlayText)).toBeInTheDocument()

    const input = getByPlaceholderText('Enter text')
    fireEvent.focus(input)
    expect(queryByText(overlayText)).not.toBeInTheDocument()
  })

  test('renders icon if provided', () => {
    const { container } = render(
      <InputField value="icon test" placeholder="Enter text" icon={DummyIcon} />
    )
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  test('renders additionalItems if provided', () => {
    const additionalItemText = 'Additional'
    const { getByText } = render(
      <InputField
        value="additional test"
        placeholder="Enter text"
        additionalItems={<div>{additionalItemText}</div>}
      />
    )
    expect(getByText(additionalItemText)).toBeInTheDocument()
  })

  test('matches snapshot for default variant', () => {
    const { container } = render(
      <InputField
        value="snapshot test"
        placeholder="Enter text"
        label="Label"
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot for outline variant', () => {
    const { container } = render(
      <InputField
        value="outline snapshot"
        placeholder="Enter text"
        label="Outline Label"
        variant="outline"
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('autoFocus prop focuses input automatically', () => {
    const { getByPlaceholderText } = render(
      <InputField value="autofocus test" placeholder="Enter text" autoFocus />
    )
    const input = getByPlaceholderText('Enter text')
    expect(document.activeElement).toBe(input)
  })
})
