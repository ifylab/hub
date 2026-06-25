// SPDX-License-Identifier: Apache-2.0
// The real Tools patch: only what exists. skillmeld ships (active); object.ify is the next
// tool, shown as "soon" with no description until Hossein gives one. One wire links skillmeld
// to object.ify — the brand "they wire together" story (Hossein's call); the rest are feed
// wires running to the canvas edges. `details` carries the per-tool page content, added
// gradually as each tool earns it. See [[project_ify_website_content]].
import type { Tool, ToolConnection, ToolFeed } from '@ifylab/design-system'

export const tools: Tool[] = [
  {
    id: 'skillmeld',
    name: 'skillmeld',
    description: 'Compose community Claude skills into one tailored set.',
    status: 'active',
    x: 140,
    y: 150,
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'object',
    name: 'object',
    suffix: '.ify',
    status: 'soon',
    x: 760,
    y: 330,
    inputs: 1,
    outputs: 1,
  },
]

// One intentional inter-tool wire: skillmeld's output into object.ify's input.
export const connections: ToolConnection[] = [{ from: 'skillmeld', to: 'object', toInput: 0 }]

export const feeds: ToolFeed[] = [
  { dir: 'in', tool: 'skillmeld', socket: 0, hot: true },
  { dir: 'in', tool: 'skillmeld', socket: 1 },
  { dir: 'out', tool: 'skillmeld', socket: 0, hot: true },
  { dir: 'in', tool: 'object', socket: 0 },
  { dir: 'out', tool: 'object', socket: 0 },
]

export interface ToolDetail {
  /** Lead paragraphs for the tool page — real, sourced from the tool's own docs. */
  summary: string[]
  /** A few concrete points: what makes it different, how it works. */
  highlights?: string[]
  repo?: string
  license?: string
}

// Per-tool page content. Keyed by tool id; a tool with no entry shows the minimal scaffold.
export const details: Record<string, ToolDetail> = {
  skillmeld: {
    summary: [
      'skillmeld finds existing community skills for what you describe, security-scans them, and merges the best two or three into one coherent set tailored to your repo — instead of writing one from scratch.',
      'It runs on your own Claude in Claude Code, grounds in your project, and shows you what it pulled, what it found, and why before anything is installed. It builds on the existing skills ecosystem rather than replacing it.',
    ],
    highlights: [
      'Composes, never generates — every line in a merged skill traces byte-for-byte back to a source, enforced by a deterministic verifier.',
      'The mechanical work — parsing, security scanning, deduplicating, conflict detection, packaging — runs as deterministic Python with zero model calls.',
      'One pipeline: ground your repo, discover and rank candidates, security-gate each one, merge into at most three skills, and emit with a provenance record.',
    ],
    repo: 'https://github.com/ifylab/skillmeld',
    license: 'Apache-2.0',
  },
}
