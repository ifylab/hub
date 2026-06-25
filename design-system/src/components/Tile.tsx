// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import { wirePath } from '../wire/wirePath'
import { Socket } from '../wire/Socket'
import { mulberry32 } from '../wire/rng'
import styles from './Tile.module.css'

export interface TileProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  description?: string
  /** Short status label, shown as a warm pill. */
  status?: string
  /** Input socket count. A random 2-4 (seeded) if omitted. */
  inputs?: number
  /** Output socket count. A random 2-4 (seeded) if omitted. */
  outputs?: number
  /** Layout seed; defaults to a hash of the name so each tile differs but stays stable. */
  seed?: number
}

interface Stub {
  top: number // 0..1 position along the edge
  entry: number // 0..1 vertical offset of the outer end (varies the curve)
  sag: number
  length: number
}

function hashString(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return h >>> 0
}

const clampCount = (n: number): number => Math.max(2, Math.min(4, Math.round(n)))

// Each stub gets its own entry offset, sag and length, so no two wires repeat.
function buildStubs(n: number, rng: () => number): Stub[] {
  const stubs: Stub[] = []
  for (let i = 0; i < n; i++) {
    stubs.push({
      top: (i + 1) / (n + 1),
      entry: 0.15 + rng() * 0.7,
      sag: 0.16 + rng() * 0.3,
      length: 48 + Math.round(rng() * 28),
    })
  }
  return stubs
}

function Stub({ side, stub }: { side: 'left' | 'right'; stub: Stub }) {
  const w = stub.length
  const h = 30
  const mid = h / 2
  const socketX = side === 'left' ? w : 0
  const outerX = side === 'left' ? 0 : w
  const outerY = h * stub.entry
  const d =
    side === 'left'
      ? wirePath(outerX, outerY, socketX, mid, { sagFactor: stub.sag })
      : wirePath(socketX, mid, outerX, outerY, { sagFactor: stub.sag })
  const offset = `calc(${(stub.top * 100).toFixed(2)}% - ${mid}px)`
  const style = side === 'left' ? { left: -w, top: offset } : { right: -w, top: offset }
  return (
    <svg
      className={styles.stub}
      style={style}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <path className={styles.stubWire} d={d} />
      <Socket cx={socketX} cy={mid} />
    </svg>
  )
}

export function Tile({
  name,
  description,
  status,
  inputs,
  outputs,
  seed,
  className,
  ...rest
}: TileProps) {
  const { ins, outs } = useMemo(() => {
    const rng = mulberry32(seed ?? hashString(name))
    const ni = inputs !== undefined ? clampCount(inputs) : 2 + Math.floor(rng() * 3)
    const no = outputs !== undefined ? clampCount(outputs) : 2 + Math.floor(rng() * 3)
    return { ins: buildStubs(ni, rng), outs: buildStubs(no, rng) }
  }, [name, inputs, outputs, seed])

  const cls = [styles.tile, className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...rest}>
      {ins.map((s, i) => (
        <Stub key={`in${i}`} side="left" stub={s} />
      ))}
      {outs.map((s, i) => (
        <Stub key={`out${i}`} side="right" stub={s} />
      ))}
      {status ? <span className={styles.pill}>{status}</span> : null}
      <h3 className={styles.name}>{name}</h3>
      {description ? <p className={styles.desc}>{description}</p> : null}
    </div>
  )
}
