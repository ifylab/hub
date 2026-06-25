// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Nav } from './Nav'

afterEach(cleanup)

describe('Nav', () => {
  it('renders the default links', () => {
    render(<Nav />)
    expect(screen.getByRole('link', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
  })

  it('renders custom links with hrefs', () => {
    render(<Nav links={[{ label: 'Docs', href: '/docs' }]} />)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })
})
