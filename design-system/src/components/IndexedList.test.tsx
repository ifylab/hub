// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { IndexedList } from './IndexedList'

afterEach(cleanup)

describe('IndexedList', () => {
  it('renders each item with its title, joined meta, and index', () => {
    render(
      <IndexedList
        items={[
          { title: 'Interactive Urban Center', meta: ['Research Assistant', 'Tehran / 2019'], index: 1 },
          { title: 'CORAL', meta: ['Peer-reviewed, 2018'], index: 6 },
        ]}
      />,
    )
    expect(screen.getByText('Interactive Urban Center')).toBeInTheDocument()
    expect(screen.getByText('Research Assistant / Tehran / 2019')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('links the title when an href is given', () => {
    render(<IndexedList items={[{ title: 'Docs', href: '/docs' }]} />)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })
})
