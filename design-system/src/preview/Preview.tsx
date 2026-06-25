// SPDX-License-Identifier: Apache-2.0
// A development preview of the foundation: the wire field, the palette, the type
// scale, and the wire sag range. Not part of the published library.
import { useState } from 'react'
import { WireField, wirePath, Socket } from '../wire'
import {
  Button,
  Link,
  Badge,
  CodeBlock,
  IndexedList,
  Tile,
  Nav,
  Hero,
  Tools,
  NewsFeed,
  About,
  Footer,
} from '../components'
import type { Tool, ToolConnection, ToolFeed } from '../components'
import './preview.css'

const COLOR_ROLES = [
  'bg',
  'surface',
  'surface-2',
  'ink',
  'ink-muted',
  'ink-subtle',
  'line',
  'line-strong',
  'accent',
  'accent-strong',
  'accent-muted',
  'on-accent',
  'warm',
  'warm-strong',
  'warm-surface',
  'wire-rest',
  'socket',
] as const

const DEMO_TOOLS: Tool[] = [
  { id: 'skillmeld', name: 'skillmeld', description: 'Compose community Claude skills into one tailored set.', status: 'active', x: 30, y: 80, inputs: 2, outputs: 1 },
  { id: 'cobie', name: 'cobie', suffix: '.ify', description: 'Validate and export COBie data straight from the model.', status: 'active', x: 470, y: 235, inputs: 4, outputs: 1 },
  { id: 'bcf', name: 'bcf', suffix: '.ify', description: 'Turn model issues into trackable BCF topics.', status: 'beta', x: 850, y: 70, inputs: 2, outputs: 1 },
  { id: 'clash', name: 'clash', suffix: '.ify', description: 'Surface geometric clashes between disciplines.', status: 'soon', x: 70, y: 430, inputs: 2, outputs: 1 },
  { id: 'qto', name: 'qto', suffix: '.ify', description: 'Pull quantity takeoffs directly from the model.', status: 'soon', x: 830, y: 440, inputs: 2, outputs: 1 },
]
const DEMO_CONNS: ToolConnection[] = [
  { from: 'skillmeld', to: 'cobie', toInput: 0, hot: true },
  { from: 'skillmeld', to: 'cobie', toInput: 1 },
  { from: 'skillmeld', to: 'cobie', toInput: 2 },
  { from: 'clash', to: 'cobie', toInput: 3 },
  { from: 'cobie', to: 'bcf', toInput: 0, hot: true },
  { from: 'cobie', to: 'bcf', toInput: 1 },
  { from: 'cobie', to: 'qto', toInput: 0 },
]
const DEMO_FEEDS: ToolFeed[] = [
  { dir: 'in', tool: 'skillmeld', socket: 0 },
  { dir: 'in', tool: 'clash', socket: 0 },
  { dir: 'out', tool: 'bcf' },
  { dir: 'out', tool: 'qto' },
]

function WireSamples() {
  const w = 360
  const h = 132
  const sags = [0.12, 0.25, 0.4]
  return (
    <svg className="samples" viewBox={`0 0 ${w} ${h}`} role="presentation">
      {sags.map((s, i) => {
        const y = 26 + i * 40
        return (
          <g key={s}>
            <path className="sampleWire" pathLength={1} d={wirePath(28, y, w - 28, y, { sagFactor: s })} />
            <Socket cx={28} cy={y} />
            <Socket cx={w - 28} cy={y} />
          </g>
        )
      })}
    </svg>
  )
}

export function Preview() {
  const [dark, setDark] = useState(false)
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
  }

  return (
    <div className="page">
      <header className="topbar">
        <span className="kicker">.ify design system</span>
        <button className="toggle" type="button" onClick={toggle}>
          {dark ? 'Light' : 'Dark'}
        </button>
      </header>

      <div className="frame">
        <Nav />
        <Hero />
      </div>

      <section className="section">
        <h2 className="sectionTitle">Color</h2>
        <div className="swatches">
          {COLOR_ROLES.map((role) => (
            <div className="swatch" key={role}>
              <span className="chip" style={{ background: `var(--ify-${role})` }} />
              <span className="swatchName">{role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Type</h2>
        <p className="displayLg">Computational design</p>
        <p className="displayMd">Wires and sockets</p>
        <p className="displaySm">Built from practice</p>
        <p className="body">
          Body text in Hanken Grotesk — airy at reading sizes and set to a comfortable measure.
          Hierarchy comes from weight and color, not size alone.
        </p>
        <p className="label">geist mono · fragment mono · the computational signal</p>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Wire</h2>
        <p className="body">
          A cubic Bezier between two sockets, both control points pushed down so it sags like a
          cable. The sag grows with the span. Hover a wire to see it go active.
        </p>
        <WireSamples />
        <div className="fieldDemo">
          <WireField count={9} seed={5} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Components</h2>
        <div className="row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="row">
          <Link href="#preview">A wired link</Link>
          <Link href="https://github.com/ifylab" external>
            The .ify org
          </Link>
          <Badge>news</Badge>
          <Badge variant="accent">library</Badge>
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Content</h2>
        <CodeBlock lang="bash" code="npm install @ifylab/design-system" />
        <div style={{ marginTop: 'var(--ify-space-5)' }}>
          <IndexedList
            items={[
              { title: 'Interactive Urban Center', meta: ['Research Assistant', 'Tehran / 2019'], index: 1 },
              { title: '2D to 3D', meta: ['Nexus Network Journal', 'Peer-reviewed, 2019'], index: 4 },
              { title: 'CORAL', meta: ['Architectural Science Review', 'Peer-reviewed, 2018'], index: 6 },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Tool tile</h2>
        <div className="tiles">
          <Tile
            name="skillmeld"
            description="Compose community Claude skills into one tailored set."
            status="active"
          />
          <Tile
            name="cobie.ify"
            description="Normalize contractor XLSX into valid IFC and COBie."
            status="alpha"
          />
          <Tile name="bcf.ify" description="Read and write BCF issues from the command line." />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Tools (drag the tiles)</h2>
        <Tools tools={DEMO_TOOLS} connections={DEMO_CONNS} feeds={DEMO_FEEDS} />
      </section>

      <section className="section">
        <h2 className="sectionTitle">News</h2>
        <NewsFeed
          categories={['AI tools', 'Libraries', '.ify', 'Reading']}
          items={[
            { tag: 'AI tools', title: 'Claude gains end-to-end computer use', blurb: 'Agents can drive a virtual desktop without bespoke glue code.', meta: 'via Anthropic · Jun 2026', href: '#' },
            { tag: '.ify', tagWarm: true, hot: true, title: 'skillmeld composes from 200+ community skills', blurb: 'Describe a goal and skillmeld assembles a tailored skill set.', meta: 'via .ify · Jun 2026', href: '#' },
            { tag: 'Libraries', title: 'IfcOpenShell 0.8 ships streaming geometry', blurb: 'Iterate large IFC models without loading the whole file.', meta: 'via GitHub · Jun 2026', href: '#' },
          ]}
        />
      </section>

      <section className="section">
        <h2 className="sectionTitle">About</h2>
        <About
          name="Hossein Zargar"
          sections={[
            {
              kind: 'work',
              title: 'Selected work',
              items: [
                { title: 'Interactive Urban Center', meta: 'Research Assistant · 2019', index: '01' },
                { title: '2D to 3D', meta: 'Nexus Network Journal · 2019', index: '02' },
              ],
            },
            {
              kind: 'experience',
              title: 'Experience',
              items: [{ role: 'Structural Engineer', org: 'Practice', years: '2020 — present' }],
              cta: { label: 'Download CV', href: '#' },
            },
            {
              kind: 'links',
              title: 'Elsewhere',
              links: [{ label: 'GitHub', detail: 'github.com/x', href: '#' }],
            },
          ]}
        >
          <strong>Hossein Zargar</strong> — a structural engineer and computational designer
          building <strong>.ify</strong>, a growing set of focused agentic tools.
        </About>
      </section>

      <Footer
        columns={[
          { heading: 'Tools', links: [{ label: 'Tools', href: '#' }] },
          { heading: 'More', links: [{ label: 'News', href: '#' }, { label: 'About', href: '#' }] },
        ]}
        outputs={[
          { label: 'GitHub', href: '#', state: 'live' },
          { label: 'Email', href: '#', state: 'live' },
          { label: 'PyPI', state: 'soon' },
          { label: 'RSS', state: 'soon' },
        ]}
      />
    </div>
  )
}
