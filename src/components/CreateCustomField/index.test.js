import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { CreateCustomField } from './index'
import '@testing-library/jest-dom'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: { _: (str) => str }
  })
}))

jest.mock('../../hooks/useOutsideClick', () => ({
  useOutsideClick: jest.fn()
}))

describe('CreateCustomField component', () => {
  const mockOnCreateCustom = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders with correct initial state', () => {
    const { container } = render(
      <ThemeProvider>
        <CreateCustomField onCreateCustom={mockOnCreateCustom} />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('opens dropdown when clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <CreateCustomField onCreateCustom={mockOnCreateCustom} />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Create Custom'))

    expect(getByText('Note')).toBeInTheDocument()
  })

  test('calls onCreateCustom when an option is selected', () => {
    const { getByText } = render(
      <ThemeProvider>
        <CreateCustomField onCreateCustom={mockOnCreateCustom} />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Create Custom'))
    fireEvent.click(getByText('Note'))

    expect(mockOnCreateCustom).toHaveBeenCalledWith('note')
  })

  test('closes dropdown after selecting an option', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <CreateCustomField onCreateCustom={mockOnCreateCustom} />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Create Custom'))
    fireEvent.click(getByText('Note'))

    expect(queryByText('Note')).not.toBeInTheDocument()
  })

  test('toggles dropdown visibility when clicked multiple times', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <CreateCustomField onCreateCustom={mockOnCreateCustom} />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Create Custom'))
    expect(getByText('Note')).toBeInTheDocument()

    fireEvent.click(getByText('Create Custom'))
    expect(queryByText('Note')).not.toBeInTheDocument()
  })
})
