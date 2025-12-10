import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ListItem } from './index'
import '@testing-library/jest-dom'

jest.mock('../../lib-react-components', () => ({
  BrushIcon: () => <svg data-testid="brush-icon" />,
  DeleteIcon: () => <svg data-testid="delete-icon" />,
  LockCircleIcon: () => <svg data-testid="lock-icon" />,
  ShareIcon: () => <svg data-testid="share-icon" />
}))

describe('Item Component', () => {
  const dummyItem = {
    name: 'vault-123',
    createdAt: 'Created 13/06/2025'
  }

  test('renders Item component correctly and matches snapshot', () => {
    const { asFragment } = render(
      <ThemeProvider>
        <ListItem
          itemName={dummyItem.name}
          itemDateText={dummyItem.createdAt}
          onClick={() => {}}
          onShareClick={() => {}}
          onEditClick={() => {}}
          onDeleteClick={() => {}}
        />
      </ThemeProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('calls onClick when Item container is clicked', () => {
    const onClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ListItem
          itemName={dummyItem.name}
          itemDateText={dummyItem.createdAt}
          onClick={onClick}
          onShareClick={() => {}}
          onEditClick={() => {}}
          onDeleteClick={() => {}}
        />
      </ThemeProvider>
    )

    fireEvent.click(container.firstChild)
    expect(onClick).toHaveBeenCalled()
  })

  test('calls onShareClick when share icon is clicked', () => {
    const onShareClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ListItem
          itemName={dummyItem.name}
          itemDateText={dummyItem.createdAt}
          onClick={() => {}}
          onShareClick={onShareClick}
          onEditClick={() => {}}
          onDeleteClick={() => {}}
        />
      </ThemeProvider>
    )
    const shareIcon = container.querySelector('[data-testid="share-icon"]')
    expect(shareIcon).toBeInTheDocument()

    fireEvent.click(shareIcon.parentElement)
    expect(onShareClick).toHaveBeenCalled()
  })

  test('calls onEditClick when brush icon is clicked', () => {
    const onEditClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ListItem
          itemName={dummyItem.name}
          itemDateText={dummyItem.createdAt}
          onClick={() => {}}
          onShareClick={() => {}}
          onEditClick={onEditClick}
          onDeleteClick={() => {}}
        />
      </ThemeProvider>
    )
    const brushIcon = container.querySelector('[data-testid="brush-icon"]')
    expect(brushIcon).toBeInTheDocument()
    fireEvent.click(brushIcon.parentElement)
    expect(onEditClick).toHaveBeenCalled()
  })

  test('matches snapshot when action icons are clicked', () => {
    const { asFragment, container } = render(
      <ThemeProvider>
        <ListItem
          itemName={dummyItem.name}
          itemDateText={dummyItem.createdAt}
          onClick={() => {}}
          onShareClick={() => {}}
          onEditClick={() => {}}
          onDeleteClick={() => {}}
        />
      </ThemeProvider>
    )

    expect(asFragment()).toMatchSnapshot('initial state')

    const shareIcon = container.querySelector('[data-testid="share-icon"]')
    const brushIcon = container.querySelector('[data-testid="brush-icon"]')
    const deleteIcon = container.querySelector('[data-testid="delete-icon"]')

    fireEvent.click(shareIcon.parentElement)
    fireEvent.click(brushIcon.parentElement)
    fireEvent.click(deleteIcon.parentElement)

    expect(asFragment()).toMatchSnapshot('after action icons clicked')
  })
})
