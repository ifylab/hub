// SPDX-License-Identifier: Apache-2.0
// The .ify logo masters are the single source of truth in hub/brand/. This module
// records where they live and the accent "dot" the whole palette is seeded from.

/** Logo master files, relative to the hub repository root. */
export const logoMasters = {
  light: 'brand/logo-light.png',
  dark: 'brand/logo-dark.png',
} as const

/**
 * The teal accent dot in the .ify wordmark. The whole system is derived from the
 * project palette (slate-teal/sage cool structure + cream/gold warm accents) in
 * tokens.json (OKLCH). Change the palette there to re-theme everything.
 */
export const accentSeedHex = '#416f6f' as const
