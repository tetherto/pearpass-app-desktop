import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SelectLabel } from './index'

import '@testing-library/jest-dom'

describe('SelectLabel Component', () => {
  const mockSetIsOpen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with placeholder when no selected item', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <SelectLabel
          isOpen={false}
          setIsOpen={mockSetIsOpen}
          placeholder="Select an option"
        />
      </ThemeProvider>
    )

    expect(getByText('Select an option')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders correctly with selected item', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <SelectLabel
          selectedItem={{ label: 'English' }}
          isOpen={false}
          setIsOpen={mockSetIsOpen}
          placeholder="Select an option"
        />
      </ThemeProvider>
    )

    expect(getByText('English')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders ArrowDownIcon when isOpen is false', () => {
    const { container } = render(
      <ThemeProvider>
        <SelectLabel
          isOpen={false}
          setIsOpen={mockSetIsOpen}
          placeholder="Select an option"
        />
      </ThemeProvider>
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders ArrowUpIcon when isOpen is true', () => {
    const { container } = render(
      <ThemeProvider>
        <SelectLabel
          isOpen={true}
          setIsOpen={mockSetIsOpen}
          placeholder="Select an option"
        />
      </ThemeProvider>
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls setIsOpen with the correct value when clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SelectLabel
          isOpen={false}
          setIsOpen={mockSetIsOpen}
          placeholder="Select an option"
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Select an option'))
    expect(mockSetIsOpen).toHaveBeenCalledTimes(1)
    expect(mockSetIsOpen).toHaveBeenCalledWith(true)
  })
})
