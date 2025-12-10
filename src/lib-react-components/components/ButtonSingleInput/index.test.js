import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonSingleInput } from './index'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'

import '@testing-library/jest-dom'

const DummyIcon = ArrowDownIcon

describe('ButtonSingleInput Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonSingleInput onClick={handleClick} startIcon={DummyIcon}>
          Single Input Button
        </ButtonSingleInput>
      </ThemeProvider>
    )

    const buttonText = getByText('Single Input Button')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(buttonText)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders startIcon correctly with size "20"', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonSingleInput onClick={handleClick} startIcon={DummyIcon}>
          Single Input Button
        </ButtonSingleInput>
      </ThemeProvider>
    )

    const dummyIcon = container.querySelector('svg')
    expect(dummyIcon).toBeInTheDocument()
    expect(dummyIcon.getAttribute('width')).toBe('24')
    expect(dummyIcon.getAttribute('height')).toBe('24')
  })

  test('matches snapshot with default props', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonSingleInput onClick={handleClick} startIcon={DummyIcon}>
          Snapshot Button
        </ButtonSingleInput>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot with variant "bordered" and rounded "md"', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonSingleInput
          onClick={handleClick}
          startIcon={DummyIcon}
          variant="bordered"
          rounded="md"
        >
          Bordered Button
        </ButtonSingleInput>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
