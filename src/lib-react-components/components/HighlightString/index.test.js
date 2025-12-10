import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { HighlightString } from './index'
import '@testing-library/jest-dom'

describe('HighlightString Component', () => {
  test('renders plain text without numbers or symbols', () => {
    const { getByText } = render(
      <ThemeProvider>
        <HighlightString text="Hello world" />
      </ThemeProvider>
    )
    expect(getByText('Hello world')).toBeInTheDocument()
  })

  test('renders and highlights numbers and symbols correctly', () => {
    const { container, getByText } = render(
      <ThemeProvider>
        <HighlightString text="Hello 123!" />
      </ThemeProvider>
    )

    expect(container).toHaveTextContent('Hello 123!')

    const numberElement = getByText('123')
    expect(numberElement).toBeInTheDocument()

    const symbolElement = getByText('!')
    expect(symbolElement).toBeInTheDocument()

    expect(numberElement.tagName.toLowerCase()).toBe('span')
    expect(symbolElement.tagName.toLowerCase()).toBe('span')
  })

  test('matches snapshot', () => {
    const { container } = render(
      <ThemeProvider>
        <HighlightString text="Test 42, wow!" />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
