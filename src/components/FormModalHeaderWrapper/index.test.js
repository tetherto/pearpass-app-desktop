import React from 'react'

import { render, screen } from '@testing-library/react'

import { FormModalHeaderWrapper } from './index'
import '@testing-library/jest-dom'

describe('FormModalHeaderWrapper', () => {
  const mockChildren = <div data-testid="test-children">Test Children</div>
  const mockButtons = <div data-testid="test-buttons">Test Buttons</div>

  test('renders children and buttons correctly', () => {
    const { container } = render(
      <FormModalHeaderWrapper children={mockChildren} buttons={mockButtons} />
    )

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(screen.getByTestId('test-buttons')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders without children', () => {
    const { container } = render(
      <FormModalHeaderWrapper buttons={mockButtons} />
    )

    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-buttons')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders without buttons', () => {
    const { container } = render(
      <FormModalHeaderWrapper children={mockChildren} />
    )

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(screen.queryByTestId('test-buttons')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders with empty content', () => {
    const { container } = render(<FormModalHeaderWrapper />)

    expect(container).toMatchSnapshot()
  })
})
