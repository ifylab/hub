// SPDX-License-Identifier: Apache-2.0
// The wire: a cubic Bezier drawn between two sockets. Both control points exit
// horizontally and are pushed in the sag direction, so the wire hangs like a cable.
// The sag grows with the horizontal span, which reads as gravity. This matches the
// look of a Grasshopper canvas wire without solving a true catenary (for shallow sag
// a cubic Bezier and a catenary are visually indistinguishable).
import { wireDefaults } from '../foundation/tokens'

export interface WireOptions {
  /** Horizontal exit strength as a fraction of the span. Defaults to the token. */
  exitStrength?: number
  /** Sag as a fraction of the horizontal span. Defaults to the token. */
  sagFactor?: number
  /** Sag direction: 1 = down (default), -1 = up. */
  sagDir?: 1 | -1
  /** Offset added to both control points' x — bends the wire mid-span (endpoints stay put). */
  bendX?: number
  /** Offset added to both control points' y — bends the wire mid-span (endpoints stay put). */
  bendY?: number
}

export interface ControlPoints {
  c1x: number
  c1y: number
  c2x: number
  c2y: number
}

/** The two cubic-Bezier control points for a wire from (x0,y0) to (x1,y1). */
export function wireControlPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  options: WireOptions = {},
): ControlPoints {
  const k = options.exitStrength ?? wireDefaults.exitStrength
  const sagFactor = options.sagFactor ?? wireDefaults.sagFactor
  const dir = options.sagDir ?? 1
  const bendX = options.bendX ?? 0
  const bendY = options.bendY ?? 0
  const dx = x1 - x0
  const sag = sagFactor * Math.abs(dx) * dir
  return {
    c1x: x0 + k * dx + bendX,
    c1y: y0 + sag + bendY,
    c2x: x1 - k * dx + bendX,
    c2y: y1 + sag + bendY,
  }
}

const round = (v: number): number => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0)

/** An SVG path `d` string for a wire from (x0,y0) to (x1,y1). */
export function wirePath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  options: WireOptions = {},
): string {
  const { c1x, c1y, c2x, c2y } = wireControlPoints(x0, y0, x1, y1, options)
  return `M ${round(x0)} ${round(y0)} C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(x1)} ${round(y1)}`
}
