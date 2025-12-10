import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SelectItem } from './index'
import '@testing-library/jest-dom'

describe('SelectItem Component', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with item name', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <SelectItem item={{ label: 'English' }} onClick={mockOnClick} />
      </ThemeProvider>
    )

    expect(getByText('English')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls onClick when clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SelectItem item={{ label: 'English' }} onClick={mockOnClick} />
      </ThemeProvider>
    )

    fireEvent.click(getByText('English'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('renders correctly with a different item name', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <SelectItem item={{ label: 'Spanish' }} onClick={mockOnClick} />
      </ThemeProvider>
    )

    expect(getByText('Spanish')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
