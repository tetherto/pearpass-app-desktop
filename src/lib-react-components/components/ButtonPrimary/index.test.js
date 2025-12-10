import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonPrimary } from './index'
import '@testing-library/jest-dom'

describe('ButtonPrimary Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonPrimary onClick={handleClick}>Primary Button</ButtonPrimary>
      </ThemeProvider>
    )

    const buttonText = getByText('Primary Button')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(buttonText)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies type prop correctly', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonPrimary onClick={handleClick} type="submit">
          Submit Button
        </ButtonPrimary>
      </ThemeProvider>
    )

    const buttonElement = container.querySelector('button')
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement.getAttribute('type')).toBe('submit')
  })

  test('matches snapshot with default size ("md")', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonPrimary onClick={handleClick}>Snapshot Button</ButtonPrimary>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot with small size ("sm")', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonPrimary onClick={handleClick} size="sm">
          Small Button
        </ButtonPrimary>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot with large size ("lg")', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonPrimary onClick={handleClick} size="lg">
          Large Button
        </ButtonPrimary>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
