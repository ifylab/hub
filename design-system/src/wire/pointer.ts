// SPDX-License-Identifier: Apache-2.0
// A single, shared, smoothed pointer position so every wire layer can react to the cursor
// without each adding its own listener. Stores the eased client (screen) coordinates; each
// wire layer maps these into its own SVG user space. `active` stays false until the pointer
// first moves, so nothing deforms toward the top-left corner before the user has moved.
const state = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  active: false,
  raf: 0,
  subscribers: 0,
}

function onMove(e: PointerEvent): void {
  state.targetX = e.clientX
  state.targetY = e.clientY
  if (!state.active) {
    state.active = true
    state.x = e.clientX
    state.y = e.clientY
  }
}

function tick(): void {
  state.x += (state.targetX - state.x) * 0.14
  state.y += (state.targetY - state.y) * 0.14
  state.raf = requestAnimationFrame(tick)
}

/** Start tracking the pointer (idempotent, reference-counted). Returns an unsubscribe fn. */
export function subscribePointer(): () => void {
  if (typeof window === 'undefined') return () => {}
  state.subscribers += 1
  if (state.subscribers === 1) {
    window.addEventListener('pointermove', onMove, { passive: true })
    state.raf = requestAnimationFrame(tick)
  }
  return () => {
    state.subscribers -= 1
    if (state.subscribers === 0) {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(state.raf)
    }
  }
}

/** The current smoothed pointer position in client (screen) coordinates. */
export function pointer(): { x: number; y: number; active: boolean } {
  return state
}
