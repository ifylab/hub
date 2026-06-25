// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Link } from './Link'

afterEach(cleanup)

describe('Link', () => {
  it('renders an anchor with its href', () => {
    render(<Link href="/docs">Docs</Link>)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('adds a new tab and safe rel when external', () => {
    render(
      <Link href="https://github.com/ifylab" external>
        Org
      </Link>,
    )
    const a = screen.getByRole('link', { name: 'Org' })
    expect(a).toHaveAttribute('target', '_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
  })
})
