// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { Wordmark } from './Wordmark'

afterEach(cleanup)

describe('Wordmark', () => {
  it('renders .ify with an accessible label', () => {
    const { container } = render(<Wordmark />)
    expect(container.querySelector('[aria-label=".ify"]')).toBeTruthy()
    expect(container.textContent).toBe('.ify')
  })
})
