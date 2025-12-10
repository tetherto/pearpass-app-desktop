import React from 'react'

import { render } from '@testing-library/react'

import { LogoLock } from './index'
import '@testing-library/jest-dom'

describe('LogoLock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    const { container } = render(<LogoLock />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toMatchSnapshot()
  })

  it('uses default width and height when props are not provided', () => {
    const { container } = render(<LogoLock />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg.getAttribute('width')).toBe('256')
    expect(svg.getAttribute('height')).toBe('57')
  })

  it('accepts custom width and height props', () => {
    const { container } = render(<LogoLock width="100" height="50" />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '100')
    expect(svg).toHaveAttribute('height', '50')
  })
})
