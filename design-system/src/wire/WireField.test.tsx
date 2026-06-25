// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { WireField } from './WireField'

afterEach(cleanup)

describe('WireField', () => {
  it('renders one path and two sockets per wire', () => {
    const { container } = render(<WireField count={6} seed={3} idle={false} floatingCount={0} />)
    expect(container.querySelectorAll('path')).toHaveLength(6)
    expect(container.querySelectorAll('circle')).toHaveLength(12)
  })

  it('adds floating sockets beyond the wired ones', () => {
    const { container } = render(<WireField count={4} floatingCount={3} idle={false} />)
    expect(container.querySelectorAll('circle')).toHaveLength(4 * 2 + 3)
  })

  it('clamps the wire count to maxWires', () => {
    const { container } = render(<WireField count={100} maxWires={8} idle={false} />)
    expect(container.querySelectorAll('path')).toHaveLength(8)
  })

  it('is deterministic for a given seed, so hydration is stable', () => {
    const a = render(<WireField count={5} seed={42} idle={false} />)
    const first = a.container.querySelector('path')?.getAttribute('d')
    cleanup()
    const b = render(<WireField count={5} seed={42} idle={false} />)
    const second = b.container.querySelector('path')?.getAttribute('d')
    expect(first).toBe(second)
    expect(first).toMatch(/^M /)
  })

  it('draws hotCount wires in an extra (accent) class', () => {
    const { container } = render(
      <WireField count={8} seed={3} idle={false} floatingCount={0} hotCount={2} />,
    )
    const hot = Array.from(container.querySelectorAll('path')).filter(
      (p) => (p.getAttribute('class') ?? '').trim().split(/\s+/).length > 1,
    )
    expect(hot).toHaveLength(2)
  })

  it('is decorative (aria-hidden) by default', () => {
    const { container } = render(<WireField count={3} idle={false} />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})
