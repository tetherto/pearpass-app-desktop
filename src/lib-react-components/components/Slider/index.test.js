import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { Slider } from './index'
import '@testing-library/jest-dom'

describe('Slider Component', () => {
  test('renders with correct attributes', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <Slider value={30} onChange={() => {}} min={10} max={50} step={5} />
      </ThemeProvider>
    )

    const slider = getByRole('slider')
    expect(slider).toHaveAttribute('min', '10')
    expect(slider).toHaveAttribute('max', '50')
    expect(slider).toHaveAttribute('step', '5')
    expect(slider.value).toBe('30')
  })

  test('calls onChange with correct numeric value on change', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <Slider value={20} onChange={handleChange} />
      </ThemeProvider>
    )
    const slider = getByRole('slider')
    fireEvent.change(slider, { target: { value: '40' } })

    expect(handleChange).toHaveBeenCalledWith(40)
  })
})
