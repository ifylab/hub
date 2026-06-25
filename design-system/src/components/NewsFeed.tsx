// SPDX-License-Identifier: Apache-2.0
// The .ify news feed: a heading, category chips that filter the feed, and entries that plug
// into a left "bus" wire like node outputs (drawn by WireBus from the entries' real
// positions). Hot entries (e.g. .ify's own news) wire in with the accent color. Clicking a
// chip toggles it as a filter; with several active, entries matching any active tag show.
import { useRef, useState } from 'react'
import { WireBus } from '../wire/WireBus'
import styles from './NewsFeed.module.css'

export interface NewsItem {
  tag: string
  /** Render the tag in the warm (gold) accent instead of teal. */
  tagWarm?: boolean
  title: string
  href?: string
  blurb: string
  meta: string
  /** Plug this entry into the bus with the accent color. */
  hot?: boolean
}

export interface NewsFeedProps {
  items: NewsItem[]
  categories?: string[]
  heading?: string
  blurb?: string
  /** Shown in place of the feed when there are no items yet. */
  emptyMessage?: string
  /** Wire-meander seed. */
  seed?: number
  className?: string
}

export function NewsFeed({
  items,
  categories = [],
  heading = 'News',
  blurb = 'New tools, libraries, and updates worth knowing — curated.',
  emptyMessage = 'Curated updates are on the way.',
  seed = 7,
  className,
}: NewsFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string[]>([])

  const toggle = (tag: string) =>
    setActive((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))

  const shown = active.length === 0 ? items : items.filter((it) => active.includes(it.tag))

  return (
    <section className={[styles.section, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <h2 className={styles.title}>{heading}</h2>
        <p className={styles.lead}>{blurb}</p>
      </div>

      {categories.length > 0 ? (
        <div className={styles.chips} role="group" aria-label="Filter by category">
          {categories.map((c) => {
            const on = active.includes(c)
            return (
              <button
                type="button"
                className={`${styles.chip} ${on ? styles.chipActive : ''}`}
                key={c}
                aria-pressed={on}
                onClick={() => toggle(c)}
              >
                <span className={styles.dot} aria-hidden="true" />
                {c}
              </button>
            )
          })}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <p className={styles.empty}>
          {items.length === 0 ? emptyMessage : 'No updates in the selected categories yet.'}
        </p>
      ) : (
        <div className={styles.feed} ref={feedRef}>
          <WireBus containerRef={feedRef} seed={seed} />
          {shown.map((it, i) => (
          <article
            className={styles.entry}
            key={i}
            data-bus-plug=""
            data-bus-hot={it.hot ? '' : undefined}
          >
            <span className={`${styles.tag} ${it.tagWarm ? styles.tagWarm : ''}`}>{it.tag}</span>
            <h3 className={styles.entryTitle}>
              {it.href ? (
                <a href={it.href}>{it.title}</a>
              ) : (
                it.title
              )}
            </h3>
            <p className={styles.blurb}>{it.blurb}</p>
            <p className={styles.meta}>{it.meta}</p>
          </article>
          ))}
        </div>
      )}
    </section>
  )
}
