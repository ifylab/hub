// SPDX-License-Identifier: Apache-2.0
// The About / portfolio page: an intro (bio + portrait) over a feed whose section titles
// thread onto one top-to-bottom bus wire (drawn by WireBus). Only the section titles are
// nodes — the sub-rows carry no wires. Section content is data-driven (selected work,
// experience, elsewhere links) so the real resume swaps in without touching layout.
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { WireBus } from '../wire/WireBus'
import styles from './About.module.css'

export interface AboutWorkItem {
  title: string
  meta: string
  index: string
  /** When set, the title links to the work (paper DOI, repo, workshop page). */
  href?: string
  /** Optional second link, e.g. the workshop page when the primary link is the repo. */
  secondary?: { label: string; href: string }
  /** Optional small mark for the item (publisher / venue logo). Dropped in later via
   *  `/media/work/<file>`; absent items simply render without one. */
  logo?: { src: string; alt: string }
}

export interface AboutExperienceItem {
  role: string
  org: string
  years: string
}

export interface AboutLink {
  label: string
  detail?: string
  href: string
}

export type AboutSkillIcon = 'waypoints' | 'bot' | 'box' | 'server' | 'database'

export interface AboutSkillGroup {
  label: string
  items: string[]
  /** One-line description of what this category covers. */
  context?: string
  icon?: AboutSkillIcon
}

export type AboutProfileIcon = 'github' | 'scholar' | 'linkedin' | 'researchgate'

export interface AboutProfile {
  label: string
  href: string
  icon: AboutProfileIcon
}

export type AboutSection =
  | { kind: 'work'; title: string; items: AboutWorkItem[] }
  | { kind: 'experience'; title: string; items: AboutExperienceItem[]; cta?: { label: string; href: string } }
  | { kind: 'skills'; title: string; groups: AboutSkillGroup[] }
  | { kind: 'links'; title: string; links: AboutLink[] }

export interface AboutProps {
  name: string
  /** The bio paragraph. Passed as children so rich text (e.g. <strong>) works across
   *  the Astro island boundary, where props must be JSON-serializable. */
  children: ReactNode
  portraitSrc?: string
  portraitAlt?: string
  /** Profile links shown as an icon row under the bio (GitHub, Scholar, ...). */
  profiles?: AboutProfile[]
  sections?: AboutSection[]
  heading?: string
  seed?: number
  className?: string
}

// Brand glyphs (24x24, single path) for the profile row. Sourced from simple-icons;
// trademarks belong to their owners. Drawn with currentColor so they take the link color.
const PROFILE_ICONS: Record<AboutProfileIcon, string> = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  scholar:
    'M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  researchgate:
    'M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.123 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .077.53h-.005a3.334 3.334 0 0 0 .113.438c.245.743.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93a10.9 10.9 0 0 0 .043-1.207v-.82c0-.095-.047-.142-.14-.142h-3.064c-.094 0-.14.047-.14.141v.956c0 .094.046.14.14.14h1.666c.056 0 .084.03.084.086 0 .36 0 .62-.036.865-.038.244-.1.447-.147.606-.108.385-.348.664-.638.876-.29.212-.738.35-1.227.35-.545 0-.901-.15-1.21-.353-.306-.203-.517-.454-.67-.915a3.136 3.136 0 0 1-.147-.762 17.366 17.367 0 0 1-.034-.656c-.01-.26-.014-.572-.014-.939a26.401 26.403 0 0 1 .014-.938 15.821 15.822 0 0 1 .035-.656 3.19 3.19 0 0 1 .148-.76 1.89 1.89 0 0 1 .742-1.01c.344-.244.593-.352 1.137-.352.508 0 .815.096 1.144.303.33.207.528.492.764.925.047.094.111.118.198.07l1.044-.43c.075-.048.09-.115.042-.199a3.549 3.549 0 0 0-.466-.742 3 3 0 0 0-.679-.607 3.313 3.313 0 0 0-.903-.41A4.068 4.068 0 0 0 19.586 0zM8.217 5.836c-1.69 0-3.036.086-4.297.086-1.146 0-2.291 0-3.007-.029v.831l1.088.2c.744.144 1.174.488 1.174 2.264v11.288c0 1.777-.43 2.12-1.174 2.263l-1.088.2v.832c.773-.029 2.12-.086 3.465-.086 1.29 0 2.951.057 3.667.086v-.831l-1.49-.2c-.773-.115-1.174-.487-1.174-2.264v-4.784c.688.057 1.29.057 2.206.057 1.748 3.123 3.41 5.472 4.355 6.56.86 1.032 2.177 1.691 3.839 1.691.487 0 1.003-.086 1.318-.23v-.744c-1.031 0-2.063-.716-2.808-1.518-1.26-1.376-2.95-3.582-4.355-6.074 2.32-.545 4.04-2.722 4.04-4.9 0-3.208-2.492-4.698-5.758-4.698zm-.515 1.29c2.406 0 3.839 1.26 3.839 3.552 0 2.263-1.547 3.782-4.097 3.782-.974 0-1.404-.03-2.063-.086v-7.19c.66-.059 1.547-.059 2.32-.059z',
}

// Category glyphs for the skills list: monochrome line icons (Lucide), drawn with
// currentColor so they take the accent. Stroke icons, not filled like the profile brands.
const SKILL_ICONS: Record<AboutSkillIcon, ReactNode> = {
  waypoints: (
    <>
      <path d="m10.586 5.414-5.172 5.172" />
      <path d="m18.586 13.414-5.172 5.172" />
      <path d="M6 12h12" />
      <circle cx="12" cy="20" r="2" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="20" cy="12" r="2" />
      <circle cx="4" cy="12" r="2" />
    </>
  ),
  bot: (
    <>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  server: (
    <>
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </>
  ),
}

// External links open in a new tab; internal (relative) links stay in place.
const ext = (href?: string) =>
  href && /^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className={styles.secTitle} data-bus-plug="" data-bus-hot="">
      <h2 className={styles.secHeading}>{children}</h2>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  )
}

export function About({
  name,
  children,
  portraitSrc,
  portraitAlt,
  profiles = [],
  sections = [],
  heading = 'About',
  seed = 11,
  className,
}: AboutProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  return (
    <section className={[styles.section, className].filter(Boolean).join(' ')}>
      <div className={`${styles.intro} ${portraitSrc ? '' : styles.introNarrow}`}>
        <div>
          <h1 className={styles.title}>{heading}</h1>
          <div className={styles.bio}>{children}</div>
          {profiles.length > 0 ? (
            <ul className={styles.profiles}>
              {profiles.map((p) => (
                <li key={p.href}>
                  <a className={styles.profile} href={p.href} aria-label={p.label} title={p.label} {...ext(p.href)}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                      <path d={PROFILE_ICONS[p.icon]} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {portraitSrc ? (
          <div className={`${styles.portrait} ${styles.portraitHasImage}`}>
            <img className={styles.portraitImg} src={portraitSrc} alt={portraitAlt ?? name} />
          </div>
        ) : null}
      </div>

      {sections.length > 0 ? (
        <div className={styles.feed} ref={feedRef}>
          <WireBus containerRef={feedRef} endNodes seed={seed} />

          {sections.map((sec, i) => {
          if (sec.kind === 'work') {
            return (
              <div key={i}>
                <SectionTitle>{sec.title}</SectionTitle>
                <ol className={styles.worklist}>
                  {sec.items.map((w, j) => (
                    <li
                      className={w.href ? `${styles.workEntry} ${styles.workEntryLink}` : styles.workEntry}
                      key={j}
                    >
                      <div className={styles.workMain}>
                        {w.logo ? (
                          <img className={styles.workLogo} src={w.logo.src} alt={w.logo.alt} />
                        ) : null}
                        <h3 className={styles.workTitle}>
                          {w.href ? (
                            <a className={styles.workLink} href={w.href} {...ext(w.href)}>
                              {w.title}
                              <span className={styles.workArrow} aria-hidden="true">
                                ↗
                              </span>
                            </a>
                          ) : (
                            w.title
                          )}
                        </h3>
                        <p className={styles.workMeta}>{w.meta}</p>
                        {w.secondary ? (
                          <a className={styles.workSecondary} href={w.secondary.href} {...ext(w.secondary.href)}>
                            {w.secondary.label}
                            <span className={styles.workSecondaryArrow} aria-hidden="true">
                              ↗
                            </span>
                          </a>
                        ) : null}
                      </div>
                      <span className={styles.workIndex}>{w.index}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          }
          if (sec.kind === 'experience') {
            return (
              <div key={i}>
                <SectionTitle>{sec.title}</SectionTitle>
                <ul className={styles.exp}>
                  {sec.items.map((e, j) => (
                    <li key={j}>
                      <span className={styles.role}>{e.role}</span>
                      <span className={styles.org}>{e.org}</span>
                      <span className={styles.years}>{e.years}</span>
                    </li>
                  ))}
                </ul>
                {sec.cta ? (
                  <a className={styles.cta} href={sec.cta.href} {...ext(sec.cta.href)}>
                    {sec.cta.label}
                    <span aria-hidden="true">{' →'}</span>
                  </a>
                ) : null}
              </div>
            )
          }
          if (sec.kind === 'skills') {
            return (
              <div key={i}>
                <SectionTitle>{sec.title}</SectionTitle>
                <ul className={styles.skills}>
                  {sec.groups.map((g, j) => (
                    <li className={styles.skillRow} key={j}>
                      {g.icon ? (
                        <svg
                          className={styles.skillIcon}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          {SKILL_ICONS[g.icon]}
                        </svg>
                      ) : null}
                      <div className={styles.skillBody}>
                        <h3 className={styles.skillHeading}>{g.label}</h3>
                        {g.context ? <p className={styles.skillContext}>{g.context}</p> : null}
                        <p className={styles.skillTools}>
                          {g.items.map((it, k) => (
                            <span className={styles.skillTool} key={k}>
                              {it}
                            </span>
                          ))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
          return (
            <div key={i}>
              <SectionTitle>{sec.title}</SectionTitle>
              <div className={styles.elsewhere}>
                {sec.links.map((l) => (
                  <a key={l.href} href={l.href} {...ext(l.href)}>
                    {l.label}
                    {l.detail ? <span className={styles.arrow}> {`→ ${l.detail}`}</span> : null}
                  </a>
                ))}
              </div>
            </div>
          )
          })}
        </div>
      ) : null}
    </section>
  )
}
