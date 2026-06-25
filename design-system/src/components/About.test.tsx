// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { About } from './About'
import type { AboutSection } from './About'

afterEach(cleanup)

const SECTIONS: AboutSection[] = [
  { kind: 'work', title: 'Selected work', items: [{ title: 'Project A', meta: 'Role · 2019', index: '01', href: '#a' }] },
  {
    kind: 'experience',
    title: 'Experience',
    items: [{ role: 'Engineer', org: 'Practice', years: '2020 — present' }],
    cta: { label: 'Download CV', href: '#cv' },
  },
  {
    kind: 'skills',
    title: 'Capabilities',
    groups: [
      { label: 'ML & optimization', icon: 'waypoints', context: 'Models and search.', items: ['PyTorch', 'pymoo'] },
    ],
  },
  { kind: 'links', title: 'Elsewhere', links: [{ label: 'GitHub', detail: 'github.com/x', href: '#gh' }] },
]

describe('About', () => {
  it('renders the page heading and bio', () => {
    render(
      <About name="Hossein" sections={SECTIONS}>
        <strong>Hossein Zargar</strong>
      </About>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('Hossein Zargar')).toBeInTheDocument()
  })

  it('renders every section title plus its rows', () => {
    render(
      <About name="Hossein" sections={SECTIONS}>
        bio
      </About>,
    )
    expect(screen.getByRole('heading', { name: 'Selected work' })).toBeInTheDocument()
    const internal = screen.getByRole('link', { name: 'Project A' })
    expect(internal).toHaveAttribute('href', '#a')
    expect(internal).not.toHaveAttribute('target')
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Download CV/ })).toHaveAttribute('href', '#cv')
    expect(screen.getByRole('heading', { name: 'Capabilities' })).toBeInTheDocument()
    expect(screen.getByText('ML & optimization')).toBeInTheDocument()
    expect(screen.getByText('Models and search.')).toBeInTheDocument()
    expect(screen.getByText('PyTorch')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', '#gh')
  })

  it('renders a work item secondary link and logo, opening external links in a new tab', () => {
    render(
      <About
        name="Hossein"
        sections={[
          {
            kind: 'work',
            title: 'Selected work',
            items: [
              {
                title: 'Workshop',
                meta: 'Venue · 2025',
                index: '01',
                href: 'https://example.com/repo',
                secondary: { label: 'Workshop page', href: 'https://example.com/workshop' },
                logo: { src: '/media/work/x.svg', alt: 'Venue' },
              },
            ],
          },
        ]}
      >
        bio
      </About>,
    )
    const primary = screen.getByRole('link', { name: 'Workshop' })
    expect(primary).toHaveAttribute('href', 'https://example.com/repo')
    expect(primary).toHaveAttribute('target', '_blank')
    expect(primary).toHaveAttribute('rel', 'noopener noreferrer')
    const secondary = screen.getByRole('link', { name: /Workshop page/ })
    expect(secondary).toHaveAttribute('href', 'https://example.com/workshop')
    expect(secondary).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('img', { name: 'Venue' })).toHaveAttribute('src', '/media/work/x.svg')
  })

  it('renders profile icon links under the bio', () => {
    render(
      <About name="Hossein" profiles={[{ label: 'GitHub', href: 'https://github.com/x', icon: 'github' }]}>
        bio
      </About>,
    )
    const link = screen.getByRole('link', { name: 'GitHub' })
    expect(link).toHaveAttribute('href', 'https://github.com/x')
    expect(link.querySelector('svg')).toBeInTheDocument()
  })

  it('renders bio-only (no feed) when there are no sections', () => {
    const { container } = render(
      <About name="Hossein" sections={[]}>
        just the bio
      </About>,
    )
    expect(screen.getByText('just the bio')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-bus-plug]')).toHaveLength(0)
  })

  it('plugs only the section titles into the bus', () => {
    const { container } = render(
      <About name="Hossein" sections={SECTIONS}>
        bio
      </About>,
    )
    expect(container.querySelectorAll('[data-bus-plug]')).toHaveLength(4)
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0)
  })
})
