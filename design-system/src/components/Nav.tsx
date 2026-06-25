// SPDX-License-Identifier: Apache-2.0
import type { HTMLAttributes } from 'react'
import { Wordmark } from './Wordmark'
import styles from './Nav.module.css'

export interface NavLink {
  label: string
  href: string
}

export interface NavProps extends HTMLAttributes<HTMLElement> {
  links?: NavLink[]
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Tools', href: '#tools' },
  { label: 'News', href: '#news' },
  { label: 'About', href: '#about' },
  { label: 'GitHub', href: '#github' },
]

/** The site top bar: the .ify wordmark and primary navigation. */
export function Nav({ links = DEFAULT_LINKS, className, ...rest }: NavProps) {
  const cls = [styles.topbar, className].filter(Boolean).join(' ')
  return (
    <header className={cls} {...rest}>
      <Wordmark size="sm" />
      <nav className={styles.nav}>
        {links.map((l) => (
          <a key={l.href} className={styles.link} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
