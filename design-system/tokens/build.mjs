// SPDX-License-Identifier: Apache-2.0
// Compile tokens/tokens.json into framework-neutral CSS custom properties and a
// typed TypeScript module. Run with `npm run tokens`. Generated files are not edited
// by hand. Colors split into a light default plus a dark theme (opt-in via
// data-theme="dark", and automatic under prefers-color-scheme: dark unless
// data-theme="light" forces light).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const tokens = JSON.parse(readFileSync(resolve(here, 'tokens.json'), 'utf8'))

const PREFIX = '--ify'

function flatten(obj, parts) {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue
    const next = [...parts, k]
    if (v && typeof v === 'object') out.push(...flatten(v, next))
    else out.push([`${PREFIX}-${next.join('-')}`, String(v)])
  }
  return out
}

const colorVars = (theme) =>
  Object.entries(tokens.color[theme]).map(([k, v]) => [`${PREFIX}-${k}`, String(v)])

const baseVars = []
for (const [section, value] of Object.entries(tokens)) {
  if (section === 'color') continue
  if (value && typeof value === 'object') baseVars.push(...flatten(value, [section]))
  else baseVars.push([`${PREFIX}-${section}`, String(value)])
}

// The token compiler classifies vars by name; these clamp/unitless values don't map to
// color/spacing/radius/font, so tag them "other".
const otherKind = (name) =>
  name.startsWith(`${PREFIX}-display-`) ||
  name.startsWith(`${PREFIX}-motion-`) ||
  name === `${PREFIX}-wire-sag-factor` ||
  name === `${PREFIX}-wire-exit-strength`

const decl = (pairs, indent = '  ') =>
  pairs
    .map(([k, v]) => `${indent}${k}: ${v};${otherKind(k) ? ' /* @kind other */' : ''}`)
    .join('\n')

const css = `/* AUTO-GENERATED from tokens/tokens.json by tokens/build.mjs. Do not edit by hand. */
:root {
${decl(colorVars('light'))}

${decl(baseVars)}
}

[data-theme="dark"] {
${decl(colorVars('dark'))}
}

/* Auto dark: mirror the [data-theme="dark"] palette for visitors with an OS dark
   preference who haven't explicitly chosen a theme. Scoped to a [data-*] attribute
   selector so the token compiler registers it as the dark theme scope. */
@media (prefers-color-scheme: dark) {
  [data-theme="auto"] {
${decl(colorVars('dark'), '    ')}
  }
}
`

const ts = `// AUTO-GENERATED from tokens/tokens.json by tokens/build.mjs. Do not edit by hand.
// SPDX-License-Identifier: Apache-2.0
export const tokens = ${JSON.stringify(tokens, null, 2)} as const

export type Tokens = typeof tokens

/** Numeric constants the wire engine needs (mirrors the --ify-wire-* CSS vars). */
export const wireDefaults = {
  sagFactor: tokens.wire["sag-factor"],
  exitStrength: tokens.wire["exit-strength"],
} as const
`

mkdirSync(resolve(root, 'src/foundation'), { recursive: true })
writeFileSync(resolve(root, 'src/foundation/tokens.css'), css)
writeFileSync(resolve(root, 'src/foundation/tokens.ts'), ts)
console.log('tokens: wrote src/foundation/tokens.css and src/foundation/tokens.ts')
