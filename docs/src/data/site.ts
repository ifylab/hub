// SPDX-License-Identifier: Apache-2.0
// Shared chrome content: the top nav, the footer columns, and the footer output bank.
import type { FooterColumn, FooterOutput } from '@ifylab/design-system'

export const GITHUB_URL = 'https://github.com/ifylab'
// Public contact. ify@ifylab.dev forwards to Hossein's inbox (forward set up at launch);
// the personal address is never exposed.
export const EMAIL = 'mailto:ify@ifylab.dev'

export const tagline = 'growing set of focused agentic tools'

export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: 'Tools', href: '/#tools' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
  { label: 'GitHub', href: GITHUB_URL },
]

export const footerDescription = 'growing set of focused agentic tools, built on open source. Apache 2.0.'

// Keep the footer lean: don't echo the top nav, and don't list a link twice. The off-site
// destinations live in the output bank below. (GitHub is in the nav, so it is not repeated here.)
export const footerColumns: FooterColumn[] = []

// The output bank: Email and the site's own RSS feed are live; PyPI stays muted until skillmeld's
// package is the reason to show it. Flip a state to 'live' + add the href when it lands.
export const footerOutputs: FooterOutput[] = [
  { label: 'Email', href: EMAIL, state: 'live' },
  { label: 'RSS', href: '/rss.xml', state: 'live' },
  { label: 'PyPI', state: 'soon' },
]

export const copyright = '© 2026 Hossein Zargar · ifylab.dev · Apache-2.0'
