import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SettingsReportSection } from './index'

import '@testing-library/jest-dom'

describe('SettingsReportSection', () => {
  const renderWithProviders = (component) =>
    render(<ThemeProvider>{component}</ThemeProvider>)

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <SettingsReportSection
        onSubmitReport={() => {}}
        message=""
        title="Report Issue"
        buttonText="Submit"
        textAreaPlaceholder="Describe the issue"
        textAreaOnChange={() => {}}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
