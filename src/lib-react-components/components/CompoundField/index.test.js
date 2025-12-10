import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { CompoundField } from './index'
import '@testing-library/jest-dom'

describe('CompoundField Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <CompoundField>
          <div>Compound Field Content</div>
        </CompoundField>
      </ThemeProvider>
    )
    expect(getByText('Compound Field Content')).toBeInTheDocument()
  })

  test('matches snapshot when not disabled', () => {
    const { container } = render(
      <ThemeProvider>
        <CompoundField>Compound Field Content</CompoundField>
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot when disabled', () => {
    const { container } = render(
      <ThemeProvider>
        <CompoundField isDisabled>Compound Field Content</CompoundField>
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
