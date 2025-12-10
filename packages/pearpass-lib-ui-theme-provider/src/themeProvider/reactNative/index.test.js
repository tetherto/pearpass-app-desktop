import React from 'react'

jest.mock('react-native', () => ({
  Text: 'Text'
}))

jest.mock('styled-components/native', () => ({
  ThemeProvider: jest.fn()
}))

import { Text } from 'react-native'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'

import { ThemeProvider } from './index'
import { createStyledThemeProvider } from '../createStyledThemeProvider'

jest.mock('../createStyledThemeProvider', () => ({
  createStyledThemeProvider: jest.fn()
}))

describe('Native ThemeProvider', () => {
  beforeEach(() => {
    createStyledThemeProvider.mockClear()
  })

  it('should call createStyledThemeProvider with StyledThemeProvider and passed props', () => {
    const props = { children: <Text>Test</Text>, foo: 'bar' }
    const expectedResult = <Text>Expected Result</Text>

    createStyledThemeProvider.mockReturnValue(expectedResult)

    const result = ThemeProvider(props)

    expect(createStyledThemeProvider).toHaveBeenCalledWith(
      StyledThemeProvider,
      props
    )

    expect(result).toBe(expectedResult)
  })
})
