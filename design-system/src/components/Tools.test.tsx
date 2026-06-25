// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Tools, socketY } from './Tools'
import type { Tool, ToolConnection } from './Tools'

afterEach(cleanup)

const TOOLS: Tool[] = [
  { id: 'a', name: 'skillmeld', description: 'Compose skills.', status: 'active', x: 30, y: 80, inputs: 2, outputs: 1 },
  { id: 'b', name: 'cobie', suffix: '.ify', description: 'Export COBie.', status: 'beta', x: 470, y: 235, inputs: 4, outputs: 1 },
]
const CONNS: ToolConnection[] = [{ from: 'a', fromOutput: 0, to: 'b', toInput: 0, hot: true }]

describe('socketY', () => {
  it('evenly distributes sockets down the tile height', () => {
    expect(socketY(80, 0, 2, 150)).toBe(130) // first of two
    expect(socketY(80, 1, 2, 150)).toBe(180) // second of two
    expect(socketY(235, 0, 1, 150)).toBe(310) // single, centered
  })
})

describe('Tools', () => {
  it('renders the heading, tiles, wires, and sockets', () => {
    const { container } = render(<Tools tools={TOOLS} connections={CONNS} />)
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('skillmeld')).toBeInTheDocument()
    expect(screen.getByText('.ify')).toBeInTheDocument()
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('circle').length).toBe(2 + 1 + 4 + 1) // a:2in+1out, b:4in+1out
  })

  it('moves a tile on pointer drag (live re-routing)', () => {
    render(<Tools tools={TOOLS} connections={CONNS} />)
    const tile = screen.getByRole('button', { name: /skillmeld/i })
    expect(tile.style.left).toBe('30px')
    fireEvent.pointerDown(tile, { clientX: 0, clientY: 0, pointerId: 1, button: 0 })
    fireEvent.pointerMove(tile, { clientX: 50, clientY: 30, pointerId: 1 })
    fireEvent.pointerUp(tile, { pointerId: 1 })
    expect(tile.style.left).toBe('80px') // 30 + 50
    expect(tile.style.top).toBe('110px') // 80 + 30
  })

  it('nudges a focused tile with the arrow keys', () => {
    render(<Tools tools={TOOLS} connections={CONNS} />)
    const tile = screen.getByRole('button', { name: /skillmeld/i })
    fireEvent.keyDown(tile, { key: 'ArrowRight' })
    expect(tile.style.left).toBe('42px') // 30 + 12
    fireEvent.keyDown(tile, { key: 'ArrowDown', shiftKey: true })
    expect(tile.style.top).toBe('112px') // 80 + 32
  })

  it('keeps a dragged tile inside the patch bounds', () => {
    render(<Tools tools={TOOLS} connections={CONNS} width={1200} height={640} />)
    const tile = screen.getByRole('button', { name: /skillmeld/i })
    fireEvent.pointerDown(tile, { clientX: 0, clientY: 0, pointerId: 1, button: 0 })
    fireEvent.pointerMove(tile, { clientX: 9999, clientY: 9999, pointerId: 1 })
    expect(tile.style.left).toBe('900px') // clamped to width - tileWidth
    expect(tile.style.top).toBe('490px') // clamped to height - tileHeight
  })
})
