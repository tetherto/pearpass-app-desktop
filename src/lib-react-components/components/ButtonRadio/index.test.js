import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonRadio } from './index'
import '@testing-library/jest-dom'

describe('ButtonRadio Component', () => {
  test('handles onClick event', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonRadio onClick={handleClick} />
      </ThemeProvider>
    )

    fireEvent.click(container.querySelector('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders as a button element', () => {
    const { container } = render(
      <ThemeProvider>
        <ButtonRadio onClick={() => {}} />
      </ThemeProvider>
    )

    expect(container.querySelector('button')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })
})
