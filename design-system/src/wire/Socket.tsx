// SPDX-License-Identifier: Apache-2.0
// An open-circle socket — the input/output grip on a Grasshopper component. Render it
// inside an <svg>; it draws a ring (filled with the page background, stroked with the
// socket color) so a wire reads as plugged into it.
import styles from './wire.module.css'

export interface SocketProps {
  cx: number
  cy: number
  /** Outer radius in user units. Defaults to the --ify-wire-socket-radius token (4). */
  r?: number
  /** Render in the active (wired/hovered) color. */
  active?: boolean
  className?: string
}

export function Socket({ cx, cy, r = 4, active = false, className }: SocketProps) {
  const cls = [styles.socket, active ? styles.socketActive : '', className]
    .filter(Boolean)
    .join(' ')
  return <circle cx={cx} cy={cy} r={r} className={cls} />
}
