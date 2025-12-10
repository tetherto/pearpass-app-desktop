import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { BadgeTextItem } from './index'

jest.mock('./styles', () => ({
  BadgeContainer: ({ children }) => (
    <div data-testid="badge-container">{children}</div>
  ),
  BadgeText: ({ children, title }) => (
    <span data-testid="badge-text" title={title}>
      {children}
    </span>
  ),
  BadgeCount: ({ children }) => (
    <span data-testid="badge-count">{children}</span>
  )
}))

describe('BadgeTextItem', () => {
  test('renders word and count by default', () => {
    render(<BadgeTextItem count={3} word="alpha" />)

    expect(screen.getByTestId('badge-text')).toHaveTextContent('alpha')
    expect(screen.getByTestId('badge-count')).toHaveTextContent('#3')
  })

  test('hides count when isNumberVisible is false', () => {
    render(<BadgeTextItem count={5} word="beta" isNumberVisible={false} />)

    expect(screen.getByTestId('badge-text')).toHaveTextContent('beta')
    expect(screen.queryByTestId('badge-count')).toBeNull()
  })
})
