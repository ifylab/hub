// SPDX-License-Identifier: Apache-2.0
import type { AnchorHTMLAttributes } from 'react'
import styles from './Link.module.css'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Open in a new tab with safe rel attributes. */
  external?: boolean
}

export function Link({ external = false, className, children, ...rest }: LinkProps) {
  const cls = [styles.link, className].filter(Boolean).join(' ')
  const ext = external ? { target: '_blank', rel: 'noreferrer noopener' } : {}
  return (
    <a className={cls} {...ext} {...rest}>
      {children}
    </a>
  )
}
