// SPDX-License-Identifier: Apache-2.0
// Public entry for @ifylab/design-system. The framework-neutral token and font layers
// are imported directly as CSS (see package exports); this module is the React kit.
export * from './wire'
export * from './components'
export { tokens, wireDefaults } from './foundation/tokens'
export type { Tokens } from './foundation/tokens'
export { useMediaQuery, useFinePointer } from './foundation/media'
export { accentSeedHex, logoMasters } from './foundation/brand'
