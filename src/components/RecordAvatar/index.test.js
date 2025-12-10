import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { RecordAvatar } from './index'
import '@testing-library/jest-dom'

jest.mock('../../lib-react-components', () => ({
  CheckIcon: (props) => <svg data-testid="check-icon" {...props} />,
  StarIcon: (props) => <svg data-testid="star-icon" {...props} />
}))

const mockGetDefaultFavicon = jest.fn()
jest.mock('pearpass-lib-vault', () => ({
  getDefaultFavicon: (...args) => mockGetDefaultFavicon(...args)
}))

jest.mock('../../utils/extractDomainName', () => ({
  extractDomainName: jest.fn()
}))

describe('RecordAvatar Component', () => {
  const defaultProps = {
    initials: 'AB',
    color: '#FF5500'
  }

  beforeEach(() => {
    mockGetDefaultFavicon.mockReset()
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
  })

  test('calls getDefaultFavicon with domain (protocol stripped)', () => {
    render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} websiteDomain="https://example.com" />
      </ThemeProvider>
    )

    expect(mockGetDefaultFavicon).toHaveBeenCalled()
  })

  test('calls getDefaultFavicon with null when no websiteDomain', () => {
    render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} />
      </ThemeProvider>
    )

    expect(mockGetDefaultFavicon).not.toHaveBeenCalled()
  })

  test('renders image when getDefaultFavicon returns buffer', () => {
    const fakeBuffer = new Uint8Array([1, 2, 3])
    mockGetDefaultFavicon.mockReturnValue(fakeBuffer)

    const { container } = render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} websiteDomain="https://test.com" />
      </ThemeProvider>
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'blob:test-url')
    expect(URL.createObjectURL).toHaveBeenCalledWith(new Blob([fakeBuffer]))
  })

  test('renders initials fallback if favicon returns null', () => {
    mockGetDefaultFavicon.mockReturnValue(null)

    const { getByText } = render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} websiteDomain="https://test.com" />
      </ThemeProvider>
    )

    expect(getByText('AB')).toBeInTheDocument()
  })

  test('renders check icon instead of favorite when both isSelected and isFavorite are true', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} isSelected={true} isFavorite={true} />
      </ThemeProvider>
    )

    expect(getByTestId('check-icon')).toBeInTheDocument()
    expect(queryByTestId('star-icon')).not.toBeInTheDocument()
  })
})
