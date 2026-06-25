// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { NewsFeed } from './NewsFeed'
import type { NewsItem } from './NewsFeed'

afterEach(cleanup)

const ITEMS: NewsItem[] = [
  { tag: 'AI tools', title: 'First', blurb: 'one', meta: 'via X · Jun 2026', href: '#a' },
  { tag: '.ify', tagWarm: true, hot: true, title: 'Second', blurb: 'two', meta: 'via .ify · Jun 2026' },
]

describe('NewsFeed', () => {
  it('renders the heading, chips, and entries', () => {
    render(<NewsFeed items={ITEMS} categories={['AI tools', 'Libraries']} />)
    expect(screen.getByRole('heading', { name: 'News' })).toBeInTheDocument()
    expect(screen.getByText('Libraries')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute('href', '#a')
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('marks a hot entry for the accent bus stub', () => {
    const { container } = render(<NewsFeed items={ITEMS} />)
    expect(container.querySelectorAll('[data-bus-plug]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-bus-hot]')).toHaveLength(1)
  })

  it('draws the bus wire layer', () => {
    const { container } = render(<NewsFeed items={ITEMS} />)
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0)
  })

  it('filters entries when a tag chip is toggled, and restores on deselect', () => {
    render(<NewsFeed items={ITEMS} categories={['AI tools', '.ify']} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()

    const ifyChip = screen.getByRole('button', { name: /\.ify/ })
    fireEvent.click(ifyChip)
    expect(ifyChip).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('First')).toBeNull() // 'AI tools' entry filtered out
    expect(screen.getByText('Second')).toBeInTheDocument() // '.ify' entry kept

    fireEvent.click(ifyChip)
    expect(ifyChip).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('First')).toBeInTheDocument()
  })

  it('shows an empty state (and no wires) when there are no items', () => {
    const { container } = render(<NewsFeed items={[]} emptyMessage="Nothing yet." />)
    expect(screen.getByText('Nothing yet.')).toBeInTheDocument()
    expect(container.querySelectorAll('article')).toHaveLength(0)
    expect(container.querySelectorAll('path')).toHaveLength(0)
  })
})
