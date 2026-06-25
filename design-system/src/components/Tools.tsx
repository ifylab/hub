// SPDX-License-Identifier: Apache-2.0
// The tools laid out as a Grasshopper patch: tile nodes wired output socket -> input socket
// with sagging cables. Tiles are draggable; every connected wire's path recomputes from the
// live socket positions on each move (the signature canvas interaction). The patch lives in a
// fixed coordinate space and is scaled to fit, so pointer deltas are mapped back through the
// scale. Keyboard users can nudge a focused tile with the arrow keys.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { useReducedMotion } from 'motion/react'
import { wirePath } from '../wire/wirePath'
import { Socket } from '../wire/Socket'
import { subscribePointer, pointer } from '../wire/pointer'
import { sampleWire, reactivePath, cursorInSvg } from '../wire/reactive'
import { useFinePointer, useMediaQuery } from '../foundation/media'
import styles from './Tools.module.css'

export type ToolStatus = 'active' | 'beta' | 'soon'

export interface Tool {
  id: string
  name: string
  /** Subtle suffix after the name, e.g. ".ify". */
  suffix?: string
  description?: string
  status: ToolStatus
  /** Destination for the title/description link (the rest of the tile is a drag handle). */
  href?: string
  /** Top-left position in patch coordinates. */
  x: number
  y: number
  /** Input / output socket counts. Grown to cover any wired index if too small. */
  inputs?: number
  outputs?: number
}

export interface ToolConnection {
  from: string
  fromOutput?: number
  to: string
  toInput?: number
  hot?: boolean
}

export interface ToolFeed {
  /** 'in' enters from the left edge into a tool input; 'out' exits a tool output to the right. */
  dir: 'in' | 'out'
  tool: string
  socket?: number
  hot?: boolean
}

export interface ToolsProps {
  tools: Tool[]
  connections?: ToolConnection[]
  feeds?: ToolFeed[]
  heading?: string
  blurb?: string
  /** Patch coordinate space. Default 1200 x 640. */
  width?: number
  height?: number
  tileWidth?: number
  tileHeight?: number
  className?: string
}

interface Pt {
  x: number
  y: number
}

const STATUS_PILL: Record<ToolStatus, string> = {
  active: styles.pillActive,
  beta: styles.pillBeta,
  soon: styles.pillSoon,
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

/** Y of socket `index` of `count`, evenly distributed down a tile of height `tileH`. */
export function socketY(tileY: number, index: number, count: number, tileH: number): number {
  return tileY + (tileH * (index + 1)) / (count + 1)
}

export function Tools({
  tools,
  connections = [],
  feeds = [],
  heading = 'Tools',
  blurb = 'Each one does a single job well — and they wire together.',
  width = 1200,
  height = 640,
  tileWidth = 300,
  tileHeight = 150,
  className,
}: ToolsProps) {
  const [positions, setPositions] = useState<Record<string, Pt>>(() =>
    Object.fromEntries(tools.map((t) => [t.id, { x: t.x, y: t.y }])),
  )
  const [dragging, setDragging] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const reduce = useReducedMotion()
  const finePointer = useFinePointer()
  // The draggable wired graph needs room; below this width show a readable stacked list.
  const wide = useMediaQuery('(min-width: 900px)')
  const viewportRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; px: number; py: number; ox: number; oy: number } | null>(null)
  const connRefs = useRef<(SVGPathElement | null)[]>([])
  const feedRefs = useRef<(SVGPathElement | null)[]>([])
  const wiresSvgRef = useRef<SVGSVGElement>(null)
  const posRef = useRef(positions)
  posRef.current = positions

  // Socket counts per tool, grown to cover every wired index.
  const counts = useMemo(() => {
    const c: Record<string, { ni: number; no: number }> = {}
    for (const t of tools) c[t.id] = { ni: Math.max(1, t.inputs ?? 1), no: Math.max(1, t.outputs ?? 1) }
    for (const cn of connections) {
      if (c[cn.to]) c[cn.to].ni = Math.max(c[cn.to].ni, (cn.toInput ?? 0) + 1)
      if (c[cn.from]) c[cn.from].no = Math.max(c[cn.from].no, (cn.fromOutput ?? 0) + 1)
    }
    for (const f of feeds) {
      if (!c[f.tool]) continue
      if (f.dir === 'in') c[f.tool].ni = Math.max(c[f.tool].ni, (f.socket ?? 0) + 1)
      else c[f.tool].no = Math.max(c[f.tool].no, (f.socket ?? 0) + 1)
    }
    return c
  }, [tools, connections, feeds])

  // Scale the fixed patch to the available width; remember the factor for pointer math.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setScale(Math.min(1, el.clientWidth / width))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, wide])

  // Lean every wire toward the cursor each frame (control points only, sockets stay put).
  // Reads live tile positions from a ref, so dragging and the cursor lean compose.
  useEffect(() => {
    if (reduce || !finePointer || !wide) return
    const unsubscribe = subscribePointer()
    let raf = 0
    let last = 0
    const tick = (ts: number) => {
      if (ts - last >= 33) {
        last = ts
        const p = pointer()
        const cursor = p.active ? cursorInSvg(wiresSvgRef.current, p.x, p.y) : null
        const pos = posRef.current
        const inAt = (id: string, i: number): Pt => {
          const t = pos[id] ?? { x: 0, y: 0 }
          return { x: t.x, y: socketY(t.y, i, counts[id]?.ni ?? 1, tileHeight) }
        }
        const outAt = (id: string, j: number): Pt => {
          const t = pos[id] ?? { x: 0, y: 0 }
          return { x: t.x + tileWidth, y: socketY(t.y, j, counts[id]?.no ?? 1, tileHeight) }
        }
        const draw = (el: SVGPathElement, a: Pt, b: Pt) => {
          const base = sampleWire(a.x, a.y, b.x, b.y, { sagFactor: 0 }, 16)
          el.setAttribute('d', reactivePath(base, cursor, 110, 12))
        }
        connections.forEach((cn, i) => {
          const el = connRefs.current[i]
          if (el) draw(el, outAt(cn.from, cn.fromOutput ?? 0), inAt(cn.to, cn.toInput ?? 0))
        })
        feeds.forEach((f, i) => {
          const el = feedRefs.current[i]
          if (!el) return
          const node = f.dir === 'in' ? inAt(f.tool, f.socket ?? 0) : outAt(f.tool, f.socket ?? 0)
          const edge = f.dir === 'in' ? { x: 0, y: node.y } : { x: width, y: node.y }
          const [a, b] = f.dir === 'in' ? [edge, node] : [node, edge]
          draw(el, a, b)
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      unsubscribe()
    }
  }, [connections, feeds, counts, reduce, finePointer, wide, tileWidth, tileHeight, width])

  const at = (id: string): Pt => positions[id] ?? { x: 0, y: 0 }
  const inPos = (id: string, i: number): Pt => {
    const p = at(id)
    return { x: p.x, y: socketY(p.y, i, counts[id]?.ni ?? 1, tileHeight) }
  }
  const outPos = (id: string, j: number): Pt => {
    const p = at(id)
    return { x: p.x + tileWidth, y: socketY(p.y, j, counts[id]?.no ?? 1, tileHeight) }
  }

  function startDrag(e: PointerEvent<HTMLDivElement>, id: string) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // Clicks on the title/description link navigate; only the rest of the tile drags.
    if ((e.target as Element).closest('a')) return
    const p = at(id)
    drag.current = { id, px: e.clientX, py: e.clientY, ox: p.x, oy: p.y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(id)
    e.preventDefault()
  }
  function moveDrag(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    const s = scale || 1
    const x = clamp(d.ox + (e.clientX - d.px) / s, 0, width - tileWidth)
    const y = clamp(d.oy + (e.clientY - d.py) / s, 0, height - tileHeight)
    setPositions((prev) => ({ ...prev, [d.id]: { x, y } }))
  }
  function endDrag(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    drag.current = null
    setDragging(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  function nudge(e: KeyboardEvent<HTMLDivElement>, id: string) {
    const step = e.shiftKey ? 32 : 12
    const moves: Record<string, Pt> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    }
    const m = moves[e.key]
    if (!m) return
    e.preventDefault()
    setPositions((prev) => {
      const p = prev[id]
      return {
        ...prev,
        [id]: {
          x: clamp(p.x + m.x, 0, width - tileWidth),
          y: clamp(p.y + m.y, 0, height - tileHeight),
        },
      }
    })
  }

  const wireD = (a: Pt, b: Pt): string => wirePath(a.x, a.y, b.x, b.y, { sagFactor: 0 })

  return (
    <section className={[styles.section, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <h2 className={styles.title}>{heading}</h2>
        <p className={styles.blurb}>{blurb}</p>
      </div>

      {wide ? (
        <div className={styles.viewport} ref={viewportRef} style={{ height: height * scale }}>
        <div
          className={styles.patch}
          style={{ width, height, transform: `scale(${scale})` }}
        >
          <svg
            ref={wiresSvgRef}
            className={`${styles.layer} ${styles.wires}`}
            viewBox={`0 0 ${width} ${height}`}
            role="presentation"
          >
            {connections.map((cn, i) => (
              <path
                key={`c${i}`}
                ref={(el) => {
                  connRefs.current[i] = el
                }}
                className={cn.hot ? `${styles.wire} ${styles.wireHot}` : styles.wire}
                d={wireD(outPos(cn.from, cn.fromOutput ?? 0), inPos(cn.to, cn.toInput ?? 0))}
              />
            ))}
            {feeds.map((f, i) => {
              const node = f.dir === 'in' ? inPos(f.tool, f.socket ?? 0) : outPos(f.tool, f.socket ?? 0)
              const edge = f.dir === 'in' ? { x: 0, y: node.y } : { x: width, y: node.y }
              const [a, b] = f.dir === 'in' ? [edge, node] : [node, edge]
              return (
                <path
                  key={`f${i}`}
                  ref={(el) => {
                    feedRefs.current[i] = el
                  }}
                  className={f.hot ? `${styles.wire} ${styles.wireHot}` : styles.wire}
                  d={wireD(a, b)}
                />
              )
            })}
          </svg>

          {tools.map((t) => {
            const p = at(t.id)
            return (
              <div
                key={t.id}
                className={`${styles.tile} ${dragging === t.id ? styles.dragging : ''}`}
                style={{ left: p.x, top: p.y, width: tileWidth, height: tileHeight }}
                role="button"
                tabIndex={0}
                aria-roledescription="Draggable tool tile"
                aria-label={`${t.name}${t.suffix ?? ''} — ${t.status}. Drag, or use arrow keys to move.`}
                onPointerDown={(e) => startDrag(e, t.id)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={(e) => nudge(e, t.id)}
              >
                <div className={styles.tileHead}>
                  <span className={`${styles.pill} ${STATUS_PILL[t.status]}`}>{t.status}</span>
                </div>
                <div className={styles.tileBody}>
                  <a
                    className={styles.nameLink}
                    href={t.href ?? '#'}
                    draggable={false}
                    aria-label={`${t.name}${t.suffix ?? ''} — open project`}
                  >
                    {t.name}
                    {t.suffix ? <span className={styles.suffix}>{t.suffix}</span> : null}
                  </a>
                  {t.description ? (
                    <a
                      className={styles.descLink}
                      href={t.href ?? '#'}
                      draggable={false}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {t.description}
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}

          <svg className={`${styles.layer} ${styles.sockets}`} viewBox={`0 0 ${width} ${height}`} role="presentation">
            {tools.flatMap((t) => {
              const c = counts[t.id] ?? { ni: 1, no: 1 }
              return [
                ...Array.from({ length: c.ni }, (_, i) => {
                  const s = inPos(t.id, i)
                  return <Socket key={`${t.id}-i${i}`} cx={s.x} cy={s.y} />
                }),
                ...Array.from({ length: c.no }, (_, j) => {
                  const s = outPos(t.id, j)
                  return <Socket key={`${t.id}-o${j}`} cx={s.x} cy={s.y} />
                }),
              ]
            })}
            {feeds.map((f, i) => {
              const node = f.dir === 'in' ? inPos(f.tool, f.socket ?? 0) : outPos(f.tool, f.socket ?? 0)
              const edge = f.dir === 'in' ? { x: 0, y: node.y } : { x: width, y: node.y }
              return <Socket key={`fe${i}`} cx={edge.x} cy={edge.y} />
            })}
          </svg>
        </div>
        </div>
      ) : (
        <ul className={styles.list}>
          {tools.map((t) => (
            <li key={t.id} className={styles.listItem}>
              <a className={styles.listLink} href={t.href ?? '#'}>
                <span className={styles.listRow}>
                  <span className={styles.name}>
                    {t.name}
                    {t.suffix ? <span className={styles.suffix}>{t.suffix}</span> : null}
                  </span>
                  <span className={`${styles.pill} ${STATUS_PILL[t.status]}`}>{t.status}</span>
                </span>
                {t.description ? <span className={styles.listDesc}>{t.description}</span> : null}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
