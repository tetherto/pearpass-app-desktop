import React from 'react'

import { render } from '@testing-library/react'

import { store, VaultProvider } from './store'
import '@testing-library/jest-dom'

jest.mock('./slices/inviteSlice', () => ({
  __esModule: true,
  default: jest.fn(() => ({}))
}))

jest.mock('./slices/userSlice', () => ({
  __esModule: true,
  default: jest.fn(() => ({}))
}))

jest.mock('./slices/vaultSlice', () => ({
  __esModule: true,
  default: jest.fn(() => ({}))
}))

jest.mock('./slices/vaultsSlice', () => ({
  __esModule: true,
  default: jest.fn(() => ({}))
}))

describe('Redux Store', () => {
  test('should have the correct reducers', () => {
    const state = store.getState()

    expect(state).toHaveProperty('vaults')
    expect(state).toHaveProperty('vault')
    expect(state).toHaveProperty('invite')
  })

  test('VaultProvider renders without crashing', () => {
    const { getByText } = render(
      <VaultProvider>
        <div>Test Content</div>
      </VaultProvider>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })
})
