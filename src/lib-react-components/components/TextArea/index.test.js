import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { TextArea } from './index'
import '@testing-library/jest-dom'

describe('TextArea Component', () => {
  const setup = (props) =>
    render(
      <ThemeProvider>
        <TextArea {...props} />
      </ThemeProvider>
    )

  test('renders with correct value and placeholder for default variant', () => {
    const { getByPlaceholderText } = setup({
      value: 'initial text',
      placeholder: 'Enter text here',
      isDisabled: false,
      onChange: jest.fn(),
      onClick: jest.fn(),
      variant: 'default'
    })
    const textAreaElement = getByPlaceholderText('Enter text here')
    expect(textAreaElement).toBeInTheDocument()
    expect(textAreaElement.value).toBe('initial text')
  })

  test('renders with correct value and placeholder for report variant', () => {
    const { getByPlaceholderText } = setup({
      value: 'report text',
      placeholder: 'Report text here',
      isDisabled: false,
      onChange: jest.fn(),
      onClick: jest.fn(),
      variant: 'report'
    })
    const textAreaElement = getByPlaceholderText('Report text here')
    expect(textAreaElement).toBeInTheDocument()
    expect(textAreaElement.value).toBe('report text')
  })

  test('calls onChange when input value changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = setup({
      value: 'initial',
      placeholder: 'Type here',
      isDisabled: false,
      onChange: handleChange,
      onClick: jest.fn(),
      variant: 'default'
    })
    const textAreaElement = getByPlaceholderText('Type here')
    fireEvent.change(textAreaElement, { target: { value: 'changed text' } })
    expect(handleChange).toHaveBeenCalledWith('changed text')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = setup({
      value: 'initial',
      placeholder: 'Type here',
      isDisabled: true,
      onChange: handleChange,
      onClick: jest.fn(),
      variant: 'default'
    })
    const textAreaElement = getByPlaceholderText('Type here')
    fireEvent.change(textAreaElement, { target: { value: 'new text' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('calls onClick when clicked if not disabled', () => {
    const handleClick = jest.fn()
    const { getByPlaceholderText } = setup({
      value: 'clickable text',
      placeholder: 'Click here',
      isDisabled: false,
      onChange: jest.fn(),
      onClick: handleClick,
      variant: 'default'
    })
    const textAreaElement = getByPlaceholderText('Click here')
    fireEvent.click(textAreaElement)
    expect(handleClick).toHaveBeenCalledWith('clickable text')
  })

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    const { getByPlaceholderText } = setup({
      value: 'non-clickable text',
      placeholder: 'No click',
      isDisabled: true,
      onChange: jest.fn(),
      onClick: handleClick,
      variant: 'default'
    })
    const textAreaElement = getByPlaceholderText('No click')
    fireEvent.click(textAreaElement)
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('matches snapshot for default variant', () => {
    const { container } = setup({
      value: 'snapshot default',
      placeholder: 'Enter text here',
      isDisabled: false,
      onChange: jest.fn(),
      onClick: jest.fn(),
      variant: 'default'
    })
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot for report variant', () => {
    const { container } = setup({
      value: 'snapshot report',
      placeholder: 'Report here',
      isDisabled: false,
      onChange: jest.fn(),
      onClick: jest.fn(),
      variant: 'report'
    })
    expect(container.firstChild).toMatchSnapshot()
  })
})
