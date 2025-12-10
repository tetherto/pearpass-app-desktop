import React from 'react'

import { render, screen, fireEvent, act } from '@testing-library/react'

import { ModalProvider, useModal } from './ModalContext'
import { BASE_TRANSITION_DURATION } from '../constants/transitions'
import '@testing-library/jest-dom'

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn(() => 'unique-id')
}))

jest.mock('../components/Overlay', () => ({
  Overlay: ({ onClick, type, isOpen }) => (
    <div data-testid="overlay" onClick={onClick}>
      Overlay: {type}, isOpen: {isOpen.toString()}
    </div>
  )
}))

jest.mock('../containers/Modal', () => ({
  ModalWrapper: ({ children }) => (
    <div data-testid="modal-wrapper">{children}</div>
  )
}))

jest.mock('../containers/Modal/SideDrawer', () => ({
  SideDrawer: ({ children, isOpen }) => (
    <div data-testid="side-drawer" data-open={isOpen.toString()}>
      {children}
    </div>
  )
}))

const TestComponent = () => {
  const { setModal, closeModal, isOpen } = useModal()

  return (
    <div>
      <button
        onClick={() =>
          setModal(<div data-testid="modal-content">Modal Content</div>)
        }
      >
        Open Modal
      </button>
      <button onClick={closeModal}>Close Modal</button>
      <div data-testid="is-open">{isOpen.toString()}</div>
    </div>
  )
}

const TestSideDrawerComponent = () => {
  const { setModal, isOpen } = useModal()

  return (
    <div>
      <button
        onClick={() =>
          setModal(
            <div data-testid="side-drawer-content">Side Drawer Content</div>,
            { modalType: 'sideDrawer' }
          )
        }
      >
        Open Side Drawer Modal
      </button>
      <div data-testid="is-open">{isOpen.toString()}</div>
    </div>
  )
}

describe('ModalProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('renders children', () => {
    render(
      <ModalProvider>
        <div data-testid="child">Child Content</div>
      </ModalProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  test('opens and closes default modal using setModal and closeModal', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    )

    expect(screen.getByTestId('is-open').textContent).toBe('false')

    fireEvent.click(screen.getByText('Open Modal'))
    expect(screen.getByTestId('is-open').textContent).toBe('true')
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close Modal'))

    act(() => {
      jest.advanceTimersByTime(BASE_TRANSITION_DURATION)
    })

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument()
  })

  test('closes modal on Escape key press', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    )

    fireEvent.click(screen.getByText('Open Modal'))
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })

    act(() => {
      jest.advanceTimersByTime(BASE_TRANSITION_DURATION)
    })

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument()
  })

  test('closes modal on overlay click', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    )

    fireEvent.click(screen.getByText('Open Modal'))
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('overlay'))

    act(() => {
      jest.advanceTimersByTime(BASE_TRANSITION_DURATION)
    })

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument()
  })

  test('renders sideDrawer modal correctly', () => {
    render(
      <ModalProvider>
        <TestSideDrawerComponent />
      </ModalProvider>
    )

    fireEvent.click(screen.getByText('Open Side Drawer Modal'))

    expect(screen.getByTestId('side-drawer')).toBeInTheDocument()
    expect(screen.getByTestId('side-drawer-content')).toBeInTheDocument()
  })
})
