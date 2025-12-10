import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonThin } from './index'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'
import '@testing-library/jest-dom'

const DummyIcon = ArrowDownIcon

describe('ButtonThin Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonThin onClick={handleClick}>Thin Button</ButtonThin>
      </ThemeProvider>
    )

    const buttonText = getByText('Thin Button')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(buttonText)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders with startIcon and endIcon correctly', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonThin
          onClick={handleClick}
          startIcon={DummyIcon}
          endIcon={DummyIcon}
        >
          Thin Button With Icons
        </ButtonThin>
      </ThemeProvider>
    )

    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBe(2)
    icons.forEach((icon) => {
      expect(icon.getAttribute('width')).toBe('24')
      expect(icon.getAttribute('height')).toBe('24')
    })
  })

  test('matches snapshot for default variant', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonThin
          onClick={handleClick}
          startIcon={DummyIcon}
          endIcon={DummyIcon}
        >
          Snapshot Thin Button
        </ButtonThin>
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot for grey variant', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonThin
          onClick={handleClick}
          startIcon={DummyIcon}
          endIcon={DummyIcon}
          variant="grey"
        >
          Grey Thin Button
        </ButtonThin>
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
