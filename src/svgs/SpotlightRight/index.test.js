import React from 'react'

import { render } from '@testing-library/react'

import { SpotlightRight } from './index'
import '@testing-library/jest-dom'

describe('SpotlightRight', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    const { container } = render(<SpotlightRight />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toMatchSnapshot()
  })

  it('uses default width and height when props are not provided', () => {
    const { container } = render(<SpotlightRight />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg.getAttribute('width')).toBe('100%')
    expect(svg.getAttribute('height')).toBe('100%')
  })

  it('accepts custom width and height props', () => {
    const { container } = render(<SpotlightRight width="200" height="300" />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '300')
  })

  it('accepts custom fill prop', () => {
    const { container } = render(<SpotlightRight fill="#FF0000" />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('fill', '#FF0000')
  })
})
