// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

// ifylab.dev — consumes @ifylab/design-system (the sibling kit) via its built package.
// The kit is a symlinked file: dep, so React/motion must be deduped to the site's single
// copy and bundled through Vite during SSR; otherwise the kit pulls its own nested React
// and hooks fail with "Cannot read properties of null (reading 'useState')".
//
// The kit lives at ../design-system, outside this project root. Allow the dev server to serve
// its built dist/ and source CSS; otherwise Vite's fs.allow denies them and the React islands
// fail to hydrate (pages render server-side, but the wire interactions go dead). Dev-only.
const hubRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  site: 'https://ifylab.dev',
  integrations: [react(), sitemap()],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['@ifylab/design-system', 'motion', 'framer-motion'],
    },
    server: {
      fs: { allow: [hubRoot] },
    },
  },
})
