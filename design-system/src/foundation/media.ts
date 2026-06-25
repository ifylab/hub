// SPDX-License-Identifier: Apache-2.0
// Small media-query hooks for input- and size-aware behavior. SSR-safe: they return false on
// the server and on the first client render, then update after mount — so structure stays
// consistent through hydration (no mismatch) and progressively enhances.
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])
  return matches
}

/** True when the primary input can hover with a fine pointer (mouse/trackpad, incl. touch
 *  laptops). Gates cursor-reactive effects so they don't run on touch-only screens. */
export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}
