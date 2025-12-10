import React from 'react'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { InitialPageWrapper } from './index'
import '@testing-library/jest-dom'

describe('InitialPageWrapper', () => {
  const mockChildren = <div data-testid="test-children">Test Children</div>

  test('renders children correctly', () => {
    const { container } = render(
      <ThemeProvider>
        <InitialPageWrapper children={mockChildren} />
      </ThemeProvider>
    )

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders without children', () => {
    const { container } = render(
      <ThemeProvider>
        <InitialPageWrapper />
      </ThemeProvider>
    )

    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
