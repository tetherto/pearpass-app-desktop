import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonRoundIcon } from './index'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'
import '@testing-library/jest-dom'

const DummyIcon = ArrowDownIcon

describe('ButtonRoundIcon Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText, getByRole } = render(
      <ThemeProvider>
        <ButtonRoundIcon onClick={handleClick}>Round Button</ButtonRoundIcon>
      </ThemeProvider>
    )

    const buttonText = getByText('Round Button')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders with startIcon correctly', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonRoundIcon onClick={handleClick} startIcon={DummyIcon}>
          Round Button With Icon
        </ButtonRoundIcon>
      </ThemeProvider>
    )

    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBe(1)
    icons.forEach((icon) => {
      expect(icon.getAttribute('width') || icon.getAttribute('size')).toBe('24')
      expect(icon.getAttribute('height') || icon.getAttribute('size')).toBe(
        '24'
      )
    })
  })

  test('does not render startIcon if not provided', () => {
    const { container } = render(
      <ThemeProvider>
        <ButtonRoundIcon onClick={() => {}}>No Icon</ButtonRoundIcon>
      </ThemeProvider>
    )
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBe(0)
  })

  test('matches snapshot for default rendering', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonRoundIcon onClick={handleClick} startIcon={DummyIcon}>
          Snapshot Round Button
        </ButtonRoundIcon>
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders correctly when children is a React element', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonRoundIcon onClick={handleClick} startIcon={DummyIcon}>
          <span>Element Child</span>
        </ButtonRoundIcon>
      </ThemeProvider>
    )
    expect(getByText('Element Child')).toBeInTheDocument()
  })

  test('button has type="button"', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <ButtonRoundIcon onClick={() => {}}>Type Button</ButtonRoundIcon>
      </ThemeProvider>
    )
    expect(getByRole('button')).toHaveAttribute('type', 'button')
  })
})
