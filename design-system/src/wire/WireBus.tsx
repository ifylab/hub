// SPDX-License-Identifier: Apache-2.0
// A vertical "bus" wire down the left of a feed, with a sagging stub cable plugging into
// each marked row — the language News and About share. Socket positions are read from the
// real plug elements (getBoundingClientRect), so the bus reflows when content, layout, or
// fonts change. The meander is seeded, so it is stable across re-renders. The wires lean
// toward the cursor (the shared pointer) by bending only their control points, so the
// sockets stay anchored. Decorative: rendered into an absolutely-positioned SVG over the
// feed, behind the content. Static (no lean) under reduced motion.
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { mulberry32 } from './rng'
import { subscribePointer, pointer } from './pointer'
import { sampleCubic, sampleSpline, smoothPath, reactivePath, cursorInSvg } from './reactive'
import type { Pt } from './reactive'
import { useFinePointer } from '../foundation/media'
import styles from './wire.module.css'

export interface WireBusProps {
  /** The feed element the bus is drawn over. It must be the positioning context. */
  containerRef: RefObject<HTMLElement | null>
  /** CSS selector for the rows the bus plugs into. Default '[data-bus-plug]'. */
  plugSelector?: string
  /** CSS selector marking a plug as "hot" (accent stub + socket). Default '[data-bus-hot]'. */
  hotSelector?: string
  /** Left x of the bus spine, in px. Default 36. */
  busX?: number
  /** X where stubs plug into the content, in px. Default 84. */
  contentX?: number
  /** Draw a small node where each stub meets the content. Default false. */
  endNodes?: boolean
  /** Meander seed; stable across renders. Default 7. */
  seed?: number
  className?: string
}

interface Point {
  x: number
  y: number
}

interface StubGeo {
  x: number
  y: number
  endX: number
  endY: number
  c1x: number
  c1y: number
  c2x: number
  c2y: number
  hot: boolean
}

interface BusGeo {
  w: number
  h: number
  busPts: Point[]
  stubs: StubGeo[]
}

function build(
  container: HTMLElement,
  plugSelector: string,
  hotSelector: string,
  busX: number,
  contentX: number,
  seed: number,
): BusGeo {
  const plugs = Array.from(container.querySelectorAll<HTMLElement>(plugSelector))
  const fr = container.getBoundingClientRect()
  const w = container.clientWidth
  const h = container.clientHeight
  if (plugs.length === 0) return { w, h, busPts: [], stubs: [] }

  // Derive the gutter from the feed's actual left padding so the bus follows responsive
  // layout (the padding shrinks on small screens). Fall back to the props if unreadable.
  const padLeft = parseFloat(getComputedStyle(container).paddingLeft)
  const cx = Number.isFinite(padLeft) && padLeft > 0 ? padLeft : contentX
  const bx = Math.max(12, Math.min(busX, cx * 0.42))

  const rnd = mulberry32(seed)
  const busPts: Point[] = plugs.map((el, i) => {
    const r = el.getBoundingClientRect()
    const dir = i % 2 === 0 ? 1 : -1
    return {
      x: bx + dir * (12 + rnd() * 12),
      y: r.top - fr.top + Math.min(r.height / 2, 30),
    }
  })

  const stubs: StubGeo[] = plugs.map((el, i) => {
    const p = busPts[i]
    const s1 = (rnd() * 2 - 1) * 16
    const s2 = (rnd() * 2 - 1) * 16
    const endY = p.y + (rnd() * 14 - 7)
    // Plug the stub a little short of the content edge so the socket sits beside the text,
    // not under its first character.
    const ex = cx - 14
    const k = (ex - p.x) * (0.3 + rnd() * 0.35)
    return {
      x: p.x,
      y: p.y,
      endX: ex,
      endY,
      c1x: p.x + k,
      c1y: p.y + s1,
      c2x: ex - k,
      c2y: endY + s2,
      hot: el.matches(hotSelector),
    }
  })

  return { w, h, busPts, stubs }
}

// The bus spine stays put (so the sockets never detach from it); only the short stub cables
// react to the cursor, gently.
const STUB_RADIUS = 72
const STUB_STRENGTH = 6

// The bus threads the socket points top to bottom. It stays static so the sockets never
// detach from it; only the stubs react to the cursor.
function busD(pts: Point[]): string {
  if (pts.length === 0) return ''
  // Start and end the spine at the first and last sockets — no overhang past the top/bottom
  // nodes, so there is no stray vertical line above the first or below the last section.
  const spine: Pt[] = pts.map((p) => ({ x: p.x, y: p.y }))
  return smoothPath(sampleSpline(spine, 8))
}

function stubD(s: StubGeo, cursor: Pt | null): string {
  const base = sampleCubic(
    { x: s.x, y: s.y },
    { x: s.c1x, y: s.c1y },
    { x: s.c2x, y: s.c2y },
    { x: s.endX, y: s.endY },
    14,
  )
  return reactivePath(base, cursor, STUB_RADIUS, STUB_STRENGTH)
}

/** The shared left-bus wire layer for the News and About feeds. */
export function WireBus({
  containerRef,
  plugSelector = '[data-bus-plug]',
  hotSelector = '[data-bus-hot]',
  busX = 36,
  contentX = 84,
  endNodes = false,
  seed = 7,
  className,
}: WireBusProps) {
  const [geo, setGeo] = useState<BusGeo | null>(null)
  const reduce = useReducedMotion()
  const finePointer = useFinePointer()
  const svgRef = useRef<SVGSVGElement>(null)
  const stubRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const redraw = () => setGeo(build(el, plugSelector, hotSelector, busX, contentX, seed))
    redraw()
    const ro = new ResizeObserver(redraw)
    ro.observe(el)
    const mo = new MutationObserver(redraw)
    mo.observe(el, { childList: true, subtree: true })
    window.addEventListener('resize', redraw)
    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', redraw)
    }
  }, [containerRef, plugSelector, hotSelector, busX, contentX, seed])

  // Redraw once web fonts settle, so the bus aligns after metrics shift.
  useEffect(() => {
    const el = containerRef.current
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (!el || !fonts?.ready) return
    let alive = true
    fonts.ready.then(() => {
      if (alive) setGeo(build(el, plugSelector, hotSelector, busX, contentX, seed))
    })
    return () => {
      alive = false
    }
  }, [containerRef, plugSelector, hotSelector, busX, contentX, seed])

  // Reform the wires locally around the cursor each frame (sockets stay anchored).
  useEffect(() => {
    if (reduce || !finePointer || !geo || geo.busPts.length === 0) return
    const unsubscribe = subscribePointer()
    let raf = 0
    let last = 0
    const tick = (ts: number) => {
      if (ts - last >= 33) {
        last = ts
        const p = pointer()
        const cursor = p.active ? cursorInSvg(svgRef.current, p.x, p.y) : null
        for (let i = 0; i < geo.stubs.length; i++) {
          const el = stubRefs.current[i]
          if (el) el.setAttribute('d', stubD(geo.stubs[i], cursor))
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      unsubscribe()
    }
  }, [geo, reduce, finePointer])

  const cls = [styles.busLayer, className].filter(Boolean).join(' ')
  return (
    <svg
      ref={svgRef}
      className={cls}
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
      width={geo?.w}
      height={geo?.h}
      role="presentation"
      aria-hidden="true"
    >
      {geo && geo.busPts.length > 0 ? (
        <path className={styles.busLine} d={busD(geo.busPts)} />
      ) : null}
      {geo?.stubs.map((s, i) => (
        <path
          key={`stub${i}`}
          ref={(el) => {
            stubRefs.current[i] = el
          }}
          className={s.hot ? `${styles.stubLine} ${styles.stubLineHot}` : styles.stubLine}
          d={stubD(s, null)}
        />
      ))}
      {geo?.stubs.map((s, i) => (
        <circle
          key={`node${i}`}
          className={s.hot ? `${styles.busNode} ${styles.busNodeHot}` : styles.busNode}
          cx={s.x}
          cy={s.y}
          r={4}
        />
      ))}
      {endNodes
        ? geo?.stubs.map((s, i) => (
            <circle
              key={`end${i}`}
              className={s.hot ? `${styles.busNode} ${styles.busNodeHot}` : styles.busNode}
              cx={s.endX}
              cy={s.endY}
              r={3}
            />
          ))
        : null}
    </svg>
  )
}
