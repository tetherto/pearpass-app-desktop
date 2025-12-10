import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { Switch } from './index'
import '@testing-library/jest-dom'

describe('Switch Component', () => {
  test('toggles switch correctly when clicked', () => {
    const handleChange = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <Switch isOn={true} onChange={handleChange} />
      </ThemeProvider>
    )

    const background = container.firstChild
    fireEvent.click(background)
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  test('matches snapshot when switched on', () => {
    const { container } = render(
      <ThemeProvider>
        <Switch isOn={true} onChange={() => {}} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot when switched off', () => {
    const { container } = render(
      <ThemeProvider>
        <Switch isOn={false} onChange={() => {}} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
