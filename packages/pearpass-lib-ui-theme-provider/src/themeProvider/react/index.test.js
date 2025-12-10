import React from 'react'

import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import { ThemeProvider } from './index'
import { createStyledThemeProvider } from '../createStyledThemeProvider'

jest.mock('../createStyledThemeProvider', () => ({
  createStyledThemeProvider: jest.fn()
}))

describe('ThemeProvider', () => {
  beforeEach(() => {
    createStyledThemeProvider.mockClear()
  })

  it('should call createStyledThemeProvider with StyledThemeProvider and passed props', () => {
    const props = { children: <div>Test</div>, foo: 'bar' }
    const expectedResult = <div>Expected Result</div>

    createStyledThemeProvider.mockReturnValue(expectedResult)

    const result = ThemeProvider(props)

    expect(createStyledThemeProvider).toHaveBeenCalledWith(
      StyledThemeProvider,
      props
    )

    expect(result).toBe(expectedResult)
  })
})
