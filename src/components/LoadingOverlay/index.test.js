import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { LoadingOverlay } from './index'
import '@testing-library/jest-dom'

describe('LoadingOverlay', () => {
  test('renders correctly', () => {
    const { container } = render(
      <ThemeProvider>
        <LoadingOverlay data-testid="loading-overlay" />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('passes props correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingOverlay
          data-testid="loading-overlay"
          id="test-id"
          className="test-class"
        />
      </ThemeProvider>
    )

    const overlay = getByTestId('loading-overlay')
    expect(overlay).toHaveAttribute('id', 'test-id')
    expect(overlay).toHaveClass('test-class')
  })
})
