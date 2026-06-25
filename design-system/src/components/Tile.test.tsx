// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Tile } from './Tile'

afterEach(cleanup)

describe('Tile', () => {
  it('renders the name, description, and status', () => {
    render(<Tile name="skillmeld" description="Compose skills." status="active" />)
    expect(screen.getByText('skillmeld')).toBeInTheDocument()
    expect(screen.getByText('Compose skills.')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('defaults to a random 2-4 sockets on each side', () => {
    const sockets = render(<Tile name="anything" />).container.querySelectorAll('circle').length
    expect(sockets).toBeGreaterThanOrEqual(4) // 2 in + 2 out
    expect(sockets).toBeLessThanOrEqual(8) // 4 in + 4 out
  })

  it('honors explicit input/output counts', () => {
    const { container } = render(<Tile name="x" inputs={3} outputs={2} />)
    expect(container.querySelectorAll('circle')).toHaveLength(5)
  })

  it('clamps explicit counts into 2-4', () => {
    const { container } = render(<Tile name="x" inputs={9} outputs={1} />)
    expect(container.querySelectorAll('circle')).toHaveLength(6) // 4 + 2
  })

  it('is stable for a given name (seeded layout)', () => {
    const first = render(<Tile name="skillmeld" />).container.querySelectorAll('circle').length
    cleanup()
    const second = render(<Tile name="skillmeld" />).container.querySelectorAll('circle').length
    expect(second).toBe(first)
  })
})
