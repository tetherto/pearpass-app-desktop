import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonSecondary } from './index'
import '@testing-library/jest-dom'

describe('ButtonSecondary Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonSecondary onClick={handleClick}>
          Secondary Button
        </ButtonSecondary>
      </ThemeProvider>
    )

    const buttonText = getByText('Secondary Button')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(buttonText)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies type prop correctly', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonSecondary onClick={handleClick} type="submit">
          Submit Button
        </ButtonSecondary>
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
        <ButtonSecondary onClick={handleClick}>Snapshot Button</ButtonSecondary>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot with small size ("sm")', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonSecondary onClick={handleClick} size="sm">
          Small Button
        </ButtonSecondary>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot with large size ("lg")', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonSecondary onClick={handleClick} size="lg">
          Large Button
        </ButtonSecondary>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
