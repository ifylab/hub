// SPDX-License-Identifier: Apache-2.0
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

// Every `styles.<name>` a component references must exist in its CSS module.
// A missing class fails silently at runtime — the element renders unstyled and
// inherits whatever the browser defaults to (the stacked-list tool names shipped
// browser-blue exactly this way). Dynamic lookups (`styles[variant]`) can't be
// checked statically and are out of scope here; their variants have their own
// render tests.

const dir = dirname(fileURLToPath(import.meta.url))

const componentSources = readdirSync(dir).filter(
  (f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'),
)

function cssClasses(css: string): Set<string> {
  const names = new Set<string>()
  // Class selectors outside comments; CSS-module keys here are simple idents.
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of noComments.matchAll(/\.([A-Za-z_][\w-]*)/g)) names.add(m[1])
  return names
}

describe('CSS module references', () => {
  for (const file of componentSources) {
    const source = readFileSync(join(dir, file), 'utf8')
    const importMatch = source.match(/import\s+(\w+)\s+from\s+'([./\w-]+\.module\.css)'/)
    if (!importMatch) continue
    const [, ident, cssPath] = importMatch

    it(`${file} references only classes defined in ${cssPath}`, () => {
      const defined = cssClasses(readFileSync(join(dir, cssPath), 'utf8'))
      const referenced = [...source.matchAll(new RegExp(`\\b${ident}\\.([A-Za-z_]\\w*)`, 'g'))].map(
        (m) => m[1],
      )
      expect(referenced.length).toBeGreaterThan(0)
      const phantom = [...new Set(referenced)].filter((name) => !defined.has(name))
      expect(phantom).toEqual([])
    })
  }
})
