// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from 'react'
import { Wordmark } from './Wordmark'
import { WireField } from '../wire/WireField'
import styles from './Hero.module.css'

export interface HeroProps {
  tagline?: string
  /** Optional call to action shown under the tagline. */
  cta?: ReactNode
  /** Layout seed for the wire bands. */
  seed?: number
  /** Logo image for light surfaces. When set with logoDark, replaces the text wordmark. */
  logoLight?: string
  /** Logo image for dark surfaces. */
  logoDark?: string
  /** Accessible name for the logo. */
  logoAlt?: string
  className?: string
}

/**
 * The site cover (Page-01): two wire bands anchored to the top and bottom edges with a
 * guaranteed-clear center band holding the bold wordmark and a short tagline. The bands
 * are live (draw-in + idle breathing) and settle to a still field under reduced motion.
 * The top bar (Nav) is composed separately by the page.
 */
export function Hero({
  tagline = 'growing set of focused agentic tools',
  cta,
  seed = 3,
  logoLight,
  logoDark,
  logoAlt = '.ify',
  className,
}: HeroProps) {
  const useLogo = Boolean(logoLight && logoDark)
  const cls = [styles.hero, className].filter(Boolean).join(' ')
  return (
    <section className={cls}>
      <div className={`${styles.band} ${styles.bandTop}`}>
        <WireField
          autoSize
          width={1280}
          height={280}
          count={5}
          seed={seed}
          hotCount={1}
          floatingCount={0}
          sagRange={[0.02, 0.05]}
        />
      </div>
      <div className={`${styles.band} ${styles.bandBottom}`}>
        <WireField
          autoSize
          width={1280}
          height={280}
          count={5}
          seed={seed + 7}
          hotCount={1}
          floatingCount={0}
          sagRange={[0.02, 0.05]}
        />
      </div>
      <div className={styles.stage}>
        <h1 className={styles.mark}>
          {useLogo ? (
            <>
              <img
                className={`${styles.markImg} ${styles.markImgLight}`}
                src={logoLight}
                alt={logoAlt}
                width="548"
                height="400"
              />
              <img
                className={`${styles.markImg} ${styles.markImgDark}`}
                src={logoDark}
                alt={logoAlt}
                width="548"
                height="400"
              />
            </>
          ) : (
            <Wordmark size="lg" />
          )}
        </h1>
        <p className={styles.tagline}>{tagline}</p>
        {cta ? <div className={styles.cta}>{cta}</div> : null}
      </div>
    </section>
  )
}
