import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonFilter } from './index'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'
import '@testing-library/jest-dom'

const DummyIcon = ArrowDownIcon

describe('ButtonFilter Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonFilter onClick={handleClick}>Filter Me</ButtonFilter>
      </ThemeProvider>
    )

    const buttonText = getByText('Filter Me')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(buttonText)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders with startIcon correctly for primary variant', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonFilter onClick={handleClick} startIcon={DummyIcon}>
          Primary Filter
        </ButtonFilter>
      </ThemeProvider>
    )

    const dummyIcon = container.querySelector('svg')

    expect(dummyIcon).toBeInTheDocument()
    expect(dummyIcon.getAttribute('width')).toBe('24')
    expect(dummyIcon.getAttribute('height')).toBe('24')
  })

  test('renders with startIcon correctly for secondary variant', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonFilter
          onClick={handleClick}
          startIcon={DummyIcon}
          variant="secondary"
        >
          Secondary Filter
        </ButtonFilter>
      </ThemeProvider>
    )

    const dummyIcon = container.querySelector('svg')

    expect(dummyIcon).toBeInTheDocument()
    expect(dummyIcon.getAttribute('width')).toBe('24')
    expect(dummyIcon.getAttribute('height')).toBe('24')
  })

  test('matches snapshot', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonFilter onClick={handleClick} startIcon={DummyIcon}>
          Snapshot Filter
        </ButtonFilter>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonFilter onClick={handleClick} isDisabled>
          Disabled Filter
        </ButtonFilter>
      </ThemeProvider>
    )

    const buttonText = getByText('Disabled Filter')
    fireEvent.click(buttonText)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
