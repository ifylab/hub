// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Hero } from './Hero'

afterEach(cleanup)

describe('Hero', () => {
  it('renders the wordmark and default tagline', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('[aria-label=".ify"]')).toBeTruthy()
    expect(screen.getByText(/focused agentic tools/)).toBeInTheDocument()
  })

  it('renders a CTA only when provided', () => {
    const { rerender } = render(<Hero />)
    expect(screen.queryByRole('link')).toBeNull()
    rerender(<Hero cta={<a href="#x">Go</a>} />)
    expect(screen.getByRole('link', { name: 'Go' })).toBeInTheDocument()
  })

  it('renders a side-to-side wire field with sockets', () => {
    const { container } = render(<Hero />)
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0)
  })
})
