import React from 'react'

import { render } from '@testing-library/react'

import { LoadingOverlay } from './index'
import '@testing-library/jest-dom'

describe('LoadingOverlay', () => {
  test('renders correctly', () => {
    const { container } = render(
      <LoadingOverlay data-testid="loading-overlay" />
    )

    expect(container).toMatchSnapshot()
  })

  test('passes props correctly', () => {
    const { getByTestId } = render(
      <LoadingOverlay
        data-testid="loading-overlay"
        id="test-id"
        className="test-class"
      />
    )

    const overlay = getByTestId('loading-overlay')
    expect(overlay).toHaveAttribute('id', 'test-id')
    expect(overlay).toHaveClass('test-class')
  })
})
