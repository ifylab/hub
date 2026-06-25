// SPDX-License-Identifier: Apache-2.0
// The site's own RSS feed, built from the curated news entries. Linked from the footer.
import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { entries } from '../data/news'

export const GET: APIRoute = (context) =>
  rss({
    title: '.ify — News',
    description: 'New tools, libraries, and updates worth knowing — curated.',
    site: context.site ?? 'https://ifylab.dev',
    items: entries.map((e) => ({
      title: e.title,
      description: e.blurb,
      link: `/news/${e.slug}/`,
      pubDate: new Date(e.date),
    })),
  })
