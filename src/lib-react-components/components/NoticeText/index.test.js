import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { NoticeText } from './index'
import '@testing-library/jest-dom'

describe('NoticeText Component', () => {
  test('renders success type correctly', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <NoticeText text="Success message" type="success" />
      </ThemeProvider>
    )
    expect(getByText('Success message')).toBeInTheDocument()

    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
    expect(svgElement.getAttribute('width')).toBe('10px')
  })

  test('renders error type correctly', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <NoticeText text="Error message" type="error" />
      </ThemeProvider>
    )
    expect(getByText('Error message')).toBeInTheDocument()
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
    expect(svgElement.getAttribute('width')).toBe('10px')
  })

  test('renders warning type correctly', () => {
    const { getByText, container } = render(
      <ThemeProvider>
        <NoticeText text="Warning message" type="warning" />
      </ThemeProvider>
    )
    expect(getByText('Warning message')).toBeInTheDocument()
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
    expect(svgElement.getAttribute('width')).toBe('10px')
  })

  test('matches snapshot for success type', () => {
    const { container } = render(
      <ThemeProvider>
        <NoticeText text="Snapshot Success" type="success" />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
