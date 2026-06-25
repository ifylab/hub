// SPDX-License-Identifier: Apache-2.0
import type { HTMLAttributes } from 'react'
import { Link } from './Link'
import styles from './IndexedList.module.css'

export interface IndexedListItem {
  title: string
  /** Sub-lines (role, venue, year), joined with a separator. */
  meta?: string[]
  /** A number or short label shown at the end of the row. */
  index?: string | number
  href?: string
}

export interface IndexedListProps extends HTMLAttributes<HTMLOListElement> {
  items: IndexedListItem[]
}

/** The portfolio contents pattern: an indexed list of entries with meta lines. */
export function IndexedList({ items, className, ...rest }: IndexedListProps) {
  const cls = [styles.list, className].filter(Boolean).join(' ')
  return (
    <ol className={cls} {...rest}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <div className={styles.main}>
            <span className={styles.title}>
              {item.href ? <Link href={item.href}>{item.title}</Link> : item.title}
            </span>
            {item.meta && item.meta.length > 0 ? (
              <span className={styles.meta}>{item.meta.join(' / ')}</span>
            ) : null}
          </div>
          {item.index !== undefined ? <span className={styles.index}>{item.index}</span> : null}
        </li>
      ))}
    </ol>
  )
}
