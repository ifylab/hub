// SPDX-License-Identifier: Apache-2.0
// A field of wires between a left and a right bank of sockets — the portfolio-cover
// language, made live. Wires draw in on mount (stroke-dashoffset) and breathe with a
// low-amplitude sag oscillation. Endpoints are generated from a seed so server and
// client render identically (no hydration flash). Motion is disabled under
// prefers-reduced-motion, where the field settles into a still composition.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { wirePath } from './wirePath'
import { Socket } from './Socket'
import { mulberry32 } from './rng'
import { subscribePointer, pointer } from './pointer'
import { sampleWire, reactivePath, cursorInSvg } from './reactive'
import { useFinePointer } from '../foundation/media'
import styles from './wire.module.css'

export interface WireFieldProps {
  /** Number of wires. Clamped to maxWires. Default 10. */
  count?: number
  /** Layout seed; stable across server/client renders. Default 1. */
  seed?: number
  /** viewBox width in user units. Default 1200. */
  width?: number
  /** viewBox height in user units. Default 420. */
  height?: number
  /** Idle breathing. Off automatically under reduced motion. Default true. */
  idle?: boolean
  /** Hard cap on wires, to protect performance. Default 24. */
  maxWires?: number
  /** Unconnected "floating" sockets scattered in the open field. Default 1. */
  floatingCount?: number
  /** Number of wires drawn in the accent ("hot") color, spread across the field. Default 0. */
  hotCount?: number
  /** Per-wire sag as [min, max] fraction of the span. Default [0.12, 0.28]. Use a small
   *  range (e.g. [0.02, 0.05]) for gentle, near-horizontal wires that don't hang. */
  sagRange?: [number, number]
  /** Measure the rendered box and use it as the 1:1 coordinate space, so the field is never
   *  scaled/cropped (wires stay complete, sockets stay round). Default false. */
  autoSize?: boolean
  /** Fraction of the vertical center to keep clear of wires (0-1). Default 0. */
  clearBand?: number
  className?: string
  /** Decorative by default. Pass false only if the field conveys meaning. */
  'aria-hidden'?: boolean
}

interface WireSpec {
  x0: number
  y0: number
  x1: number
  y1: number
  sag: number
  delayMs: number
  phase: number
  amp: number
}

function buildWires(
  n: number,
  seed: number,
  width: number,
  height: number,
  clearBand: number,
  sagRange: [number, number],
): WireSpec[] {
  const rnd = mulberry32(seed)
  const margin = 24
  const leftX = margin
  const rightX = width - margin
  const top = margin
  const bottom = height - margin
  // With a clear band, split into a top and a bottom group so the center stays open
  // and wires stay within their group — the portfolio-cover layout.
  const regions: Array<[number, number]> =
    clearBand > 0
      ? [
          [top, height * (0.5 - clearBand / 2)],
          [height * (0.5 + clearBand / 2), bottom],
        ]
      : [[top, bottom]]
  const wires: WireSpec[] = []
  for (const [rTop, rBot] of regions) {
    const rn = Math.max(1, Math.round(n / regions.length))
    const span = rBot - rTop
    // Both edges use the same evenly-spaced ladder of socket positions, so left and right
    // dots share identical spacing. The wires cross because the right ends are shuffled.
    const ladder = Array.from({ length: rn }, (_, i) => rTop + ((i + 0.5) / rn) * span)
    const targets = ladder.slice()
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      const tmp = targets[i]
      targets[i] = targets[j]
      targets[j] = tmp
    }
    for (let i = 0; i < rn; i++) {
      wires.push({
        x0: leftX,
        y0: ladder[i],
        x1: rightX,
        y1: targets[i],
        sag: sagRange[0] + rnd() * (sagRange[1] - sagRange[0]),
        delayMs: Math.round(rnd() * 600),
        phase: rnd() * Math.PI * 2,
        amp: 0.005 + rnd() * 0.01,
      })
    }
  }
  return wires
}

// Evenly-spread, deterministic set of wire indices drawn in the accent color.
function hotIndices(n: number, k: number): Set<number> {
  const set = new Set<number>()
  if (k <= 0 || n <= 0) return set
  const step = n / k
  for (let i = 0; i < k; i++) set.add(Math.min(n - 1, Math.round((i + 0.5) * step)))
  return set
}

interface Point {
  x: number
  y: number
}

// Unconnected sockets floating in the open field, from a separate seed stream.
function buildFloating(n: number, seed: number, width: number, height: number): Point[] {
  const rnd = mulberry32(seed * 7 + 13)
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    pts.push({ x: width * (0.34 + rnd() * 0.32), y: height * (0.18 + rnd() * 0.64) })
  }
  return pts
}

export function WireField({
  count = 10,
  seed = 1,
  width = 1200,
  height = 420,
  idle = true,
  maxWires = 24,
  floatingCount = 1,
  hotCount = 0,
  sagRange = [0.12, 0.28],
  autoSize = false,
  clearBand = 0,
  className,
  'aria-hidden': ariaHidden = true,
}: WireFieldProps) {
  const n = Math.min(Math.max(count, 0), maxWires)
  const hot = useMemo(() => hotIndices(n, Math.min(hotCount, n)), [n, hotCount])
  const reduce = useReducedMotion()
  const finePointer = useFinePointer()
  const sagLo = sagRange[0]
  const sagHi = sagRange[1]
  const paths = useRef<(SVGPathElement | null)[]>([])
  const svgRef = useRef<SVGSVGElement>(null)

  // With autoSize, the coordinate space is the rendered box (1:1), so preserveAspectRatio
  // never scales or crops the field. Falls back to the width/height props before first measure.
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    if (!autoSize) return
    const el = svgRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const w = Math.round(r.width)
      const h = Math.round(r.height)
      if (w > 0 && h > 0) setBox((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [autoSize])

  const vbW = autoSize && box ? box.w : width
  const vbH = autoSize && box ? box.h : height
  const wires = useMemo(
    () => buildWires(n, seed, vbW, vbH, clearBand, [sagLo, sagHi]),
    [n, seed, vbW, vbH, clearBand, sagLo, sagHi],
  )
  const floats = useMemo(
    () => buildFloating(floatingCount, seed, vbW, vbH),
    [floatingCount, seed, vbW, vbH],
  )

  useEffect(() => {
    if (reduce || !idle) return
    const unsubscribe = finePointer ? subscribePointer() : () => {}
    let raf = 0
    let startTs = 0
    let lastTs = 0
    const radius = Math.min(vbW, vbH) * 0.5
    const tick = (ts: number) => {
      if (!startTs) startTs = ts
      if (ts - lastTs >= 33) {
        lastTs = ts
        const time = (ts - startTs) / 1000
        const p = pointer()
        const cursor = finePointer && p.active ? cursorInSvg(svgRef.current, p.x, p.y) : null
        for (let i = 0; i < wires.length; i++) {
          const w = wires[i]
          const el = paths.current[i]
          if (!w || !el) continue
          const breathe = Math.sin(time * 0.6 + w.phase) * w.amp
          const base = sampleWire(w.x0, w.y0, w.x1, w.y1, { sagFactor: w.sag + breathe }, 22)
          el.setAttribute('d', reactivePath(base, cursor, radius, 12))
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      unsubscribe()
    }
  }, [wires, reduce, idle, vbW, vbH, finePointer])

  const cls = [styles.field, className].filter(Boolean).join(' ')

  return (
    <svg
      ref={svgRef}
      className={cls}
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio={autoSize ? 'none' : 'xMidYMid slice'}
      role="presentation"
      aria-hidden={ariaHidden}
    >
      {wires.map((w, i) => (
        <path
          key={i}
          ref={(el) => {
            paths.current[i] = el
          }}
          className={hot.has(i) ? `${styles.wire} ${styles.wireHot}` : styles.wire}
          pathLength={1}
          style={{ animationDelay: `${w.delayMs}ms` }}
          d={wirePath(w.x0, w.y0, w.x1, w.y1, { sagFactor: w.sag })}
        />
      ))}
      {wires.map((w, i) => (
        <Socket key={`s${i}`} cx={w.x0} cy={w.y0} />
      ))}
      {wires.map((w, i) => (
        <Socket key={`t${i}`} cx={w.x1} cy={w.y1} />
      ))}
      {floats.map((p, i) => (
        <Socket key={`f${i}`} cx={p.x} cy={p.y} />
      ))}
    </svg>
  )
}
