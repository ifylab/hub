// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Badge } from './Badge'

afterEach(cleanup)

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>news</Badge>)
    expect(screen.getByText('news')).toBeInTheDocument()
  })
})
