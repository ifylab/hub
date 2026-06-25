// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Footer } from './Footer'
import type { FooterOutput, FooterColumn } from './Footer'

afterEach(cleanup)

const COLUMNS: FooterColumn[] = [
  { heading: 'Tools', links: [{ label: 'Tools', href: '#tools' }] },
]
const OUTPUTS: FooterOutput[] = [
  { label: 'GitHub', href: '#gh', state: 'live' },
  { label: 'PyPI', state: 'soon' },
]

describe('Footer', () => {
  it('renders the wordmark, description, columns, and copyright', () => {
    const { container } = render(<Footer columns={COLUMNS} outputs={OUTPUTS} copyright="© 2026 X" />)
    expect(container.querySelector('[aria-label=".ify"]')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tools' })).toHaveAttribute('href', '#tools')
    expect(screen.getByText('© 2026 X')).toBeInTheDocument()
  })

  it('renders a live output as a link and a soon output as a tagged placeholder', () => {
    render(<Footer outputs={OUTPUTS} />)
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', '#gh')
    expect(screen.queryByRole('link', { name: /PyPI/ })).toBeNull()
    expect(screen.getByText('soon')).toBeInTheDocument()
  })

  it('draws one output wire per output row', () => {
    const { container } = render(<Footer outputs={OUTPUTS} />)
    expect(container.querySelectorAll('path')).toHaveLength(2)
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })
})
