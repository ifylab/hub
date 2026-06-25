// SPDX-License-Identifier: Apache-2.0
import type { HTMLAttributes } from 'react'
import styles from './CodeBlock.module.css'

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  code: string
  /** Optional language label shown in the corner (display only, no highlighting). */
  lang?: string
}

export function CodeBlock({ code, lang, className, ...rest }: CodeBlockProps) {
  const cls = [styles.block, className].filter(Boolean).join(' ')
  return (
    <div className={styles.wrap}>
      {lang ? <span className={styles.lang}>{lang}</span> : null}
      <pre className={cls} {...rest}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
