// SPDX-License-Identifier: Apache-2.0
import type { HTMLAttributes } from 'react'
import styles from './Wordmark.module.css'

export interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
}

/** The .ify wordmark: "ify" with the teal accent dot, set in the display face. */
export function Wordmark({ size = 'md', className, ...rest }: WordmarkProps) {
  const cls = [styles.wordmark, styles[size], className].filter(Boolean).join(' ')
  return (
    <span className={cls} aria-label=".ify" {...rest}>
      <span className={styles.dot} aria-hidden="true">
        .
      </span>
      <span aria-hidden="true">ify</span>
    </span>
  )
}
