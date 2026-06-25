// SPDX-License-Identifier: Apache-2.0
import { useRef } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { WireBus } from './WireBus'

afterEach(cleanup)

function Harness({ endNodes = false }: { endNodes?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <WireBus containerRef={ref} endNodes={endNodes} />
      <div data-bus-plug>one</div>
      <div data-bus-plug data-bus-hot>
        two
      </div>
      <div data-bus-plug>three</div>
    </div>
  )
}

describe('WireBus', () => {
  it('draws one bus path plus one stub per plug, and one socket node per plug', () => {
    const { container } = render(<Harness />)
    expect(container.querySelectorAll('path')).toHaveLength(4) // 1 bus + 3 stubs
    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('marks a hot plug with an extra class token on its stub and node', () => {
    const { container } = render(<Harness />)
    const hotPaths = Array.from(container.querySelectorAll('path')).filter(
      (p) => (p.getAttribute('class') ?? '').trim().split(/\s+/).length > 1,
    )
    expect(hotPaths).toHaveLength(1)
  })

  it('adds a content-end node per plug when endNodes is set', () => {
    const { container } = render(<Harness endNodes />)
    expect(container.querySelectorAll('circle')).toHaveLength(6) // 3 bus + 3 end
  })
})
