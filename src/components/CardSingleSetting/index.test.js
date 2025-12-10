import React from 'react'

import { render } from '@testing-library/react'

import { CardSingleSetting } from './index'
import '@testing-library/jest-dom'

jest.mock('./styles', () => ({
  Container: 'div',
  Content: 'div',
  Header: 'div',
  Title: 'h3'
}))

describe('CardSingleSetting', () => {
  it('renders with title', () => {
    const { container, getByText } = render(
      <CardSingleSetting title="Test Title" />
    )
    expect(getByText('Test Title')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <CardSingleSetting title="Test Title">
        <div>Child Content</div>
      </CardSingleSetting>
    )
    expect(getByText('Child Content')).toBeInTheDocument()
  })

  it('renders with the correct structure', () => {
    const { container } = render(
      <CardSingleSetting title="Test Title">
        <div>Child Content</div>
      </CardSingleSetting>
    )

    const header = container.querySelector('div > div:first-child')
    const content = container.querySelector('div > div:nth-child(2)')

    expect(header).toBeInTheDocument()
    expect(content).toBeInTheDocument()
  })
})
