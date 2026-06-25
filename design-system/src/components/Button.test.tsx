// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Button } from './Button'

afterEach(cleanup)

describe('Button', () => {
  it('renders its label and defaults to type=button', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('fires onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        No
      </Button>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
