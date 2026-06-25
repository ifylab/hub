// SPDX-License-Identifier: Apache-2.0
// The site footer read as one Grasshopper component: a brand block, nav columns, and an
// output bank where each output param wires off to an external destination. Outputs are
// data-driven and either "live" (a real link) or "soon" (muted, tagged) — so PyPI, RSS, or
// social flip on by editing data as they go live. Internal nav stays plain text; only the
// off-site outputs get wires.
import { Wordmark } from './Wordmark'
import styles from './Footer.module.css'

export interface FooterOutput {
  label: string
  href?: string
  /** 'live' (default) renders a link; 'soon' renders a muted, tagged placeholder. */
  state?: 'live' | 'soon'
}

export interface FooterColumn {
  heading: string
  links: Array<{ label: string; href: string }>
}

export interface FooterProps {
  description?: string
  columns?: FooterColumn[]
  outputs?: FooterOutput[]
  copyright?: string
  /** Logo image for light surfaces. When set with logoDark, replaces the text wordmark. */
  logoLight?: string
  /** Logo image for dark surfaces. */
  logoDark?: string
  /** Accessible name for the logo. */
  logoAlt?: string
  className?: string
}

// One identical sagging stub per output row, so the wires stay parallel and never cross.
const OUTPUT_WIRE = 'M 6 13 C 32 13, 64 22, 94 16'

export function Footer({
  description = 'growing set of focused agentic tools, built on open source. Apache 2.0.',
  columns = [],
  outputs = [],
  copyright = '© 2026 Hossein Zargar · ifylab.dev',
  logoLight,
  logoDark,
  logoAlt = '.ify',
  className,
}: FooterProps) {
  const useLogo = Boolean(logoLight && logoDark)
  return (
    <footer className={[styles.footer, className].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            {useLogo ? (
              <span className={styles.brandLogo}>
                <img
                  className={`${styles.brandLogoImg} ${styles.brandLogoLight}`}
                  src={logoLight}
                  alt={logoAlt}
                  width="548"
                  height="400"
                />
                <img
                  className={`${styles.brandLogoImg} ${styles.brandLogoDark}`}
                  src={logoDark}
                  alt={logoAlt}
                  width="548"
                  height="400"
                />
              </span>
            ) : (
              <Wordmark size="sm" />
            )}
            <p className={styles.desc}>{description}</p>
          </div>

          {columns.length > 0 ? (
            <nav className={styles.cols} aria-label="Footer">
              {columns.map((col) => (
                <div className={styles.col} key={col.heading}>
                  <h2 className={styles.colHeading}>{col.heading}</h2>
                  <ul className={styles.colList}>
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <a className={styles.colLink} href={l.href}>
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          ) : null}

          {outputs.length > 0 ? (
            <div className={styles.output}>
              <div className={styles.bank}>
                {outputs.map((o, i) => {
                  const soon = o.state === 'soon'
                  const arrow = (
                    <span className={styles.arrow} aria-hidden="true">
                      {'→'}
                    </span>
                  )
                  return (
                    <div className={`${styles.outRow} ${soon ? styles.soon : ''}`} key={i}>
                      <svg
                        className={styles.wireSvg}
                        width={100}
                        height={28}
                        viewBox="0 0 100 28"
                        aria-hidden="true"
                      >
                        <path className={styles.owire} d={OUTPUT_WIRE} />
                        <circle className={styles.osocket} cx={6} cy={13} r={4.5} />
                      </svg>
                      {soon || !o.href ? (
                        <span className={styles.olink}>{o.label} {arrow}</span>
                      ) : (
                        <a className={styles.olink} href={o.href}>
                          {o.label} {arrow}
                        </a>
                      )}
                      {soon ? <span className={styles.soonTag}>soon</span> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.baseline}>
          <span className={styles.copy}>{copyright}</span>
        </div>
      </div>
    </footer>
  )
}
