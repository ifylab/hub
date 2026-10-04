// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Tools, socketY, feedBleed } from './Tools'
import type { Tool, ToolConnection, ToolFeed } from './Tools'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

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

describe('feedBleed', () => {
  it('is zero when the patch already sits at the edge margin', () => {
    expect(feedBleed(24, 1224, 1248, 1, 24)).toEqual({ left: 0, right: 0 })
  })
  it('runs the stubs out to the margin on a wide window', () => {
    expect(feedBleed(360, 1560, 1920, 1, 24)).toEqual({ left: 336, right: 336 })
  })
  it('never pulls the stubs inside the patch', () => {
    expect(feedBleed(10, 910, 920, 0.75, 24)).toEqual({ left: 0, right: 0 })
  })
  it('converts screen pixels to patch units through the scale', () => {
    expect(feedBleed(84, 984, 1068, 0.75, 24)).toEqual({ left: 80, right: 80 })
  })
  it('is zero before the patch has a size', () => {
    expect(feedBleed(0, 0, 0, 0, 24)).toEqual({ left: 0, right: 0 })
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

  it('runs feed stubs past the patch to the window edge', () => {
    const feeds: ToolFeed[] = [
      { dir: 'in', tool: 'a', socket: 0 },
      { dir: 'out', tool: 'b', socket: 0 },
    ]
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this === document.documentElement ? 1920 : 1200
    })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 360,
      right: 1560,
    } as DOMRect)
    const { container } = render(<Tools tools={TOOLS} connections={CONNS} feeds={feeds} />)
    const xs = Array.from(container.querySelectorAll('circle')).map((c) => Number(c.getAttribute('cx')))
    expect(xs).toContain(-336) // in-feed edge socket, 24px inside the window
    expect(xs).toContain(1536) // out-feed edge socket: 1200 + 336
  })
})
