// SPDX-License-Identifier: Apache-2.0
// Local "magnetic" cursor reactivity for wires. A wire is sampled into points; points within
// the cursor's radius are pushed away with a soft falloff (endpoints stay anchored, so the
// sockets never move); the displaced points are re-smoothed into a path. The result is that
// only the part of a wire near the cursor reforms — not a global shift. Cursor coordinates
// must be in the same space as the points (each layer maps the screen cursor into its own SVG
// user space via getScreenCTM before calling these).
import { wireControlPoints } from './wirePath'
import type { WireOptions } from './wirePath'

export interface Pt {
  x: number
  y: number
}

function round(v: number): number {
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0
}

/** A point on a cubic Bezier at parameter t. */
export function cubicAt(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y,
  }
}

/** Sample a wire (the cubic from wireControlPoints) into n+1 points. */
export function sampleWire(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  options: WireOptions = {},
  n = 20,
): Pt[] {
  const cp = wireControlPoints(x0, y0, x1, y1, options)
  const p0 = { x: x0, y: y0 }
  const c1 = { x: cp.c1x, y: cp.c1y }
  const c2 = { x: cp.c2x, y: cp.c2y }
  const p1 = { x: x1, y: y1 }
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) pts.push(cubicAt(p0, c1, c2, p1, i / n))
  return pts
}

/** Sample an explicit cubic into n+1 points. */
export function sampleCubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt, n = 16): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) pts.push(cubicAt(p0, c1, c2, p1, i / n))
  return pts
}

/** Sample a Catmull-Rom spline through control points (perSeg points per segment). */
export function sampleSpline(points: Pt[], perSeg = 8): Pt[] {
  if (points.length < 2) return points.slice()
  const out: Pt[] = [points[0]]
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? points[i + 1]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    for (let j = 1; j <= perSeg; j++) out.push(cubicAt(p1, c1, c2, p2, j / perSeg))
  }
  return out
}

/** Push points away from the cursor with a soft radial falloff. Endpoints stay anchored. */
export function repel(pts: Pt[], cx: number, cy: number, radius: number, strength: number): Pt[] {
  return pts.map((p, i) => {
    if (i === 0 || i === pts.length - 1) return p
    const dx = p.x - cx
    const dy = p.y - cy
    const dist = Math.hypot(dx, dy)
    if (dist >= radius || dist === 0) return p
    const f = 1 - dist / radius
    const m = f * f * strength
    return { x: p.x + (dx / dist) * m, y: p.y + (dy / dist) * m }
  })
}

/** A smooth SVG path through points (Catmull-Rom converted to cubic segments). */
export function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${round(pts[0].x)} ${round(pts[0].y)}`
  let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? pts[i + 1]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(p2.x)} ${round(p2.y)}`
  }
  return d
}

/** Build a wire path from base sample points, reformed locally around the cursor (or null). */
export function reactivePath(
  base: Pt[],
  cursor: Pt | null,
  radius: number,
  strength: number,
): string {
  const pts = cursor ? repel(base, cursor.x, cursor.y, radius, strength) : base
  return smoothPath(pts)
}

/** Map a screen-space (clientX/clientY) point into an SVG element's user space. */
export function cursorInSvg(svg: SVGSVGElement | null, clientX: number, clientY: number): Pt | null {
  if (!svg || typeof svg.getScreenCTM !== 'function') return null
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const inv = ctm.inverse()
  return {
    x: inv.a * clientX + inv.c * clientY + inv.e,
    y: inv.b * clientX + inv.d * clientY + inv.f,
  }
}
