// SPDX-License-Identifier: Apache-2.0
import type { HTMLAttributes } from 'react'
import styles from './Badge.module.css'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent'
}

export function Badge({ variant = 'neutral', className, ...rest }: BadgeProps) {
  const cls = [styles.badge, styles[variant], className].filter(Boolean).join(' ')
  return <span className={cls} {...rest} />
}
