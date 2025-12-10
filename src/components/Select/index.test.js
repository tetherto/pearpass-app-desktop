import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { Select } from './index'
import '@testing-library/jest-dom'

describe('Select Component', () => {
  const mockOnItemSelect = jest.fn()

  const items = [
    { label: 'English' },
    { label: 'Italian' },
    { label: 'Spanish' },
    { label: 'French' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with placeholder when no selected item', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <Select
          items={items}
          onItemSelect={mockOnItemSelect}
          placeholder="Select a language"
        />
      </ThemeProvider>
    )

    expect(getByText('Select a language')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders correctly with a selected item', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <Select
          selectedItem={{ label: 'English' }}
          items={items}
          onItemSelect={mockOnItemSelect}
          placeholder="Select a language"
        />
      </ThemeProvider>
    )

    expect(getByText('English')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('opens dropdown when label is clicked', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <Select
          items={items}
          onItemSelect={mockOnItemSelect}
          placeholder="Select a language"
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Select a language'))
    expect(getByText('English')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls onItemSelect with the correct item when an option is clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Select
          items={items}
          onItemSelect={mockOnItemSelect}
          placeholder="Select a language"
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Select a language'))
    fireEvent.click(getByText('Italian'))

    expect(mockOnItemSelect).toHaveBeenCalledTimes(1)
    expect(mockOnItemSelect).toHaveBeenCalledWith({ label: 'Italian' })
  })

  test('closes dropdown when an option is selected', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <Select
          items={items}
          onItemSelect={mockOnItemSelect}
          placeholder="Select a language"
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Select a language'))
    fireEvent.click(getByText('Italian'))

    expect(queryByText('Italian')).not.toBeInTheDocument()
  })

  test('closes dropdown when clicking outside', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <Select
          items={items}
          onItemSelect={mockOnItemSelect}
          placeholder="Select a language"
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Select a language'))
    fireEvent.mouseDown(document.body)

    expect(container.querySelector('ul')).not.toBeInTheDocument()
  })
})
