import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { FormWrapper } from './index'
import '@testing-library/jest-dom'

describe('FormWrapper', () => {
  test('renders correctly', () => {
    const { container } = render(
      <ThemeProvider>
        <FormWrapper />
      </ThemeProvider>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders with children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <FormWrapper>
          <div>Test Child</div>
        </FormWrapper>
      </ThemeProvider>
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  test('renders multiple children in correct order', () => {
    const { container } = render(
      <ThemeProvider>
        <FormWrapper>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </FormWrapper>
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })
})
