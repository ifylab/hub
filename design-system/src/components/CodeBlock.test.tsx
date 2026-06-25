// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { CodeBlock } from './CodeBlock'

afterEach(cleanup)

describe('CodeBlock', () => {
  it('renders the code', () => {
    render(<CodeBlock code="npm install" />)
    expect(screen.getByText('npm install')).toBeInTheDocument()
  })

  it('shows the language label when given', () => {
    render(<CodeBlock code="x = 1" lang="py" />)
    expect(screen.getByText('py')).toBeInTheDocument()
  })
})
