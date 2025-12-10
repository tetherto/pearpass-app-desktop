import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { EmptyCollectionView } from './index'
import '@testing-library/jest-dom'

jest.mock('../../context/RouterContext', () => ({
  useRouter: () => ({
    data: {
      recordType: 'all'
    }
  })
}))

const mockHandleCreateOrEditRecord = jest.fn()
jest.mock('../../hooks/useCreateOrEditRecord', () => ({
  useCreateOrEditRecord: () => ({
    handleCreateOrEditRecord: mockHandleCreateOrEditRecord
  })
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: { _: (str) => str }
  })
}))

describe('EmptyCollectionView component', () => {
  const renderComponent = () =>
    render(
      <ThemeProvider>
        <EmptyCollectionView />
      </ThemeProvider>
    )

  test('renders empty collection message', () => {
    const { container, getByText } = renderComponent()
    expect(getByText('This collection is empty.')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('displays all create options when recordType is "all"', () => {
    const { getByText } = renderComponent()
    expect(getByText('Create a login')).toBeInTheDocument()
    expect(getByText('Create an identity')).toBeInTheDocument()
    expect(getByText('Create a credit card')).toBeInTheDocument()
    expect(getByText('Create a note')).toBeInTheDocument()
    expect(getByText('Create a custom element')).toBeInTheDocument()
  })
  test('buttons are clickable and trigger handleCreateOrEditRecord', () => {
    const { getByText } = renderComponent()
    const loginButton = getByText('Create a login')

    fireEvent.click(loginButton)
    expect(mockHandleCreateOrEditRecord).toHaveBeenCalledWith({
      recordType: 'login'
    })
  })

  test('displays help text', () => {
    const { getByText } = renderComponent()
    expect(
      getByText('Create a new element or pass to another collection')
    ).toBeInTheDocument()
  })
})
