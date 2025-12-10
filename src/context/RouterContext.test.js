import React from 'react'

import { render, act } from '@testing-library/react'

import { RouterProvider, useRouter } from './RouterContext'

const TestComponent = () => {
  const { currentPage, data, navigate } = useRouter()
  return (
    <div>
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="record-id">{data.recordId}</div>
      <div data-testid="record-type">{data.recordType}</div>
      <button
        data-testid="navigate-button"
        onClick={() =>
          navigate('test-page', { recordId: '123', recordType: 'password' })
        }
      >
        Navigate
      </button>
    </div>
  )
}

describe('RouterContext', () => {
  test('should provide initial router state', () => {
    const { getByTestId } = render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>
    )

    expect(getByTestId('current-page').textContent).toBe('loading')
    expect(getByTestId('record-id').textContent).toBe('')
    expect(getByTestId('record-type').textContent).toBe('all')
  })

  test('should navigate to a new page with data', () => {
    const { getByTestId } = render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>
    )

    expect(getByTestId('current-page').textContent).toBe('loading')

    act(() => {
      getByTestId('navigate-button').click()
    })

    expect(getByTestId('current-page').textContent).toBe('test-page')
    expect(getByTestId('record-id').textContent).toBe('123')
    expect(getByTestId('record-type').textContent).toBe('password')
  })

  test('should handle multiple navigation events', () => {
    const MultiNavComponent = () => {
      const { currentPage, navigate } = useRouter()
      return (
        <div>
          <div data-testid="current-page">{currentPage}</div>
          <button data-testid="nav1" onClick={() => navigate('page1')}>
            Nav1
          </button>
          <button data-testid="nav2" onClick={() => navigate('page2')}>
            Nav2
          </button>
        </div>
      )
    }

    const { getByTestId } = render(
      <RouterProvider>
        <MultiNavComponent />
      </RouterProvider>
    )

    expect(getByTestId('current-page').textContent).toBe('loading')

    act(() => {
      getByTestId('nav1').click()
    })
    expect(getByTestId('current-page').textContent).toBe('page1')

    act(() => {
      getByTestId('nav2').click()
    })
    expect(getByTestId('current-page').textContent).toBe('page2')
  })
})
