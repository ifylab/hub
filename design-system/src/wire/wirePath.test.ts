// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest'
import { wirePath, wireControlPoints } from './wirePath'

describe('wireControlPoints', () => {
  it('exits horizontally and sags downward by default', () => {
    const cp = wireControlPoints(0, 100, 200, 100, { exitStrength: 0.5, sagFactor: 0.25 })
    // Horizontal exit: control points sit at half the span in x.
    expect(cp.c1x).toBe(100)
    expect(cp.c2x).toBe(100)
    // Sag is positive (down) and equal on both controls for a level wire.
    expect(cp.c1y).toBe(150)
    expect(cp.c2y).toBe(150)
  })

  it('scales sag with the horizontal span', () => {
    const short = wireControlPoints(0, 0, 100, 0, { sagFactor: 0.25 })
    const long = wireControlPoints(0, 0, 400, 0, { sagFactor: 0.25 })
    expect(long.c1y).toBeGreaterThan(short.c1y)
    expect(long.c1y).toBe(100) // 0.25 * 400
    expect(short.c1y).toBe(25) // 0.25 * 100
  })

  it('flips the sag direction when sagDir is -1', () => {
    const cp = wireControlPoints(0, 0, 200, 0, { sagFactor: 0.25, sagDir: -1 })
    expect(cp.c1y).toBe(-50)
    expect(cp.c2y).toBe(-50)
  })

  it('uses the absolute span so a right-to-left wire still sags down', () => {
    const cp = wireControlPoints(200, 0, 0, 0, { sagFactor: 0.25 })
    expect(cp.c1y).toBe(50)
    expect(cp.c2y).toBe(50)
  })

  it('degenerates to no sag for a zero-length wire', () => {
    const cp = wireControlPoints(50, 50, 50, 50, { sagFactor: 0.25 })
    expect(cp.c1y).toBe(50)
    expect(cp.c2y).toBe(50)
  })
})

describe('wirePath', () => {
  it('returns a move-then-cubic path with the endpoints preserved', () => {
    expect(wirePath(0, 100, 200, 100, { exitStrength: 0.5, sagFactor: 0.25 })).toBe(
      'M 0 100 C 100 150 100 150 200 100',
    )
  })

  it('is pure: identical inputs give identical output', () => {
    const a = wirePath(10, 20, 330, 240, { sagFactor: 0.2 })
    const b = wirePath(10, 20, 330, 240, { sagFactor: 0.2 })
    expect(a).toBe(b)
  })

  it('rounds coordinates to two decimals', () => {
    const d = wirePath(0, 0, 333, 0, { exitStrength: 0.5, sagFactor: 0.3333 })
    expect(d).not.toMatch(/\.\d{3,}/)
  })
})
