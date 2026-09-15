// SPDX-License-Identifier: Apache-2.0
// The real Tools patch: only what exists. skillmeld and wireify ship (active); object.ify is
// the next tool, shown as "soon" with no description until Hossein gives one. Inter-tool wires
// carry the brand "they wire together" story and must reflect real data flow; the rest are feed
// wires running to the canvas edges. `details` carries the per-tool page content, added
// gradually as each tool earns it. See [[project_ify_website_content]].
import type { Tool, ToolConnection, ToolFeed } from '@ifylab/design-system'

export const tools: Tool[] = [
  {
    id: 'skillmeld',
    name: 'skillmeld',
    description: 'Compose community Claude skills into one tailored set.',
    status: 'active',
    x: 75,
    y: 240,
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'wireify',
    name: 'wireify',
    description: 'Your own Claude Code, live on the Grasshopper canvas.',
    status: 'active',
    x: 470,
    y: 85,
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'halo',
    name: 'halo',
    description: 'HALO.gh as a web app, made with Wireify 0.3.',
    status: 'active',
    x: 880,
    y: 85,
    inputs: 1,
    // Nothing runs downstream of the showcase: the graph ends here.
    outputs: 0,
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
  {
    id: 'robotic-constructability',
    name: 'robotic constructability',
    description: '999 robot-assembled CLT houses.',
    status: 'active',
    x: 240,
    y: 460,
    inputs: 1,
    outputs: 1,
  },
]

// Intentional inter-tool wires: skillmeld's output into object.ify's input, and into
// wireify's — skillmeld genuinely composed the Grasshopper skills wireify ships in its
// agent homes (vendored, MIT, credited in wireify's PROVENANCE.md). wireify's output
// into halo: the HALO page is a companion app wireify built, ported to run on its own;
// nothing runs downstream of it, so it carries no out-feed.
export const connections: ToolConnection[] = [
  { from: 'skillmeld', to: 'object', toInput: 0 },
  { from: 'skillmeld', to: 'wireify', toInput: 0 },
  { from: 'wireify', to: 'halo', toInput: 0 },
]

export const feeds: ToolFeed[] = [
  { dir: 'in', tool: 'skillmeld', socket: 0, hot: true },
  { dir: 'in', tool: 'skillmeld', socket: 1 },
  { dir: 'in', tool: 'wireify', socket: 1 },
  { dir: 'in', tool: 'object', socket: 0 },
  { dir: 'out', tool: 'object', socket: 0 },
  { dir: 'in', tool: 'robotic-constructability', socket: 0 },
  { dir: 'out', tool: 'robotic-constructability', socket: 0, hot: true },
]

export interface ToolDetail {
  /** Lead paragraphs for the tool page — real, sourced from the tool's own docs. */
  summary: string[]
  /** A few concrete points: what makes it different, how it works. */
  highlights?: string[]
  /** Demo stills, served from public/media/tools/. */
  media?: { src: string; alt: string; caption?: string }[]
  repo?: string
  license?: string
  /** Outbound links beside the repo CTA — marketplace listings and the like. A `download`
   *  link saves the file instead of opening a tab (a definition, a dataset). */
  links?: { label: string; href: string; download?: boolean }[]
  /** Calls to action under the lede, above the app: the first is primary. A site-relative
   *  href opens in the same tab. */
  cta?: { label: string; href: string }[]
  /** Live app embedded on the page. `src` is the deployed origin, or a site-relative path
   *  for an app hosted under public/ (same origin); the page appends `?embed=1&theme=` and
   *  keeps the frame on the site theme via `ify:theme` postMessage. `full` is where "open
   *  full screen" goes when the app has its own home (a subdomain); default `src`. */
  app?: { src: string; full?: string }
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
      'Discovery runs against a signed hosted catalog — Ed25519-signed manifest, hash-pinned content, refreshed weekly — and the local security gate always has the final word.',
    ],
    repo: 'https://github.com/ifylab/skillmeld',
    license: 'Apache-2.0',
  },
  wireify: {
    summary: [
      'Wireify connects your own Claude Code to the live Grasshopper canvas. Drop a Wireify socket, wire your inputs into it, and tell Claude what the component should do. It reads the data actually flowing through your wires — tree shapes, types, samples — writes a typed Python 3 script, runs it, reads Grasshopper’s runtime errors, and fixes them in place while you watch.',
      'The socket converts into a stock Rhino Python 3 component: same position, wires kept, outputs solved. Saved definitions carry no Wireify dependency — colleagues without the plugin open your files like any other definition.',
      'Since 0.3 each definition can also have a companion web app: a browser page the plugin serves on your own machine, in step with the canvas both ways. Sliders and panels on the page push into Grasshopper; every solve pushes back into the page’s 3D view, drawings and figures; one button bakes a frozen HTML report. Claude builds the page from the definition, and using it needs no Claude session. HALO is one of them: a tensegrity study from a 2021 manuscript, built this way and running on this site.',
      'Wireify makes no AI calls and needs no account of its own. It hosts an MCP server and connects the Claude Code you already have — your subscription, your data boundaries. Requires Claude Code (paid plan or Console API credits).',
      'Install from the Rhino Package Manager: in Rhino 8 on Windows (SR18 or newer), run _PackageManager and search "wireify", then restart Rhino. Mac support is planned; Rhino 7 is not supported. Version 0.2.0 no longer connects to current Claude Code; the Package Manager updates it.',
    ],
    cta: [
      { label: 'See a companion app', href: '/tools/halo' },
    ],
    highlights: [
      'Reads live wire data before writing a line — tree shapes, types, samples — then verifies its own component against Grasshopper’s runtime errors.',
      'Converts in place to a stock Python 3 component: wires kept, one undo step, zero plugin dependency in saved files.',
      'Each definition gets its own agent home with built-in Grasshopper skills and a memory that accumulates what worked — Claude starts warm and gets warmer per file.',
      'Every definition can carry a companion web app — sliders, figures, drawings and a 3D view in the browser, in step with the canvas both ways, no Claude session needed to use it.',
      'Built on the official MCP C# SDK at the current protocol revision, with 22 canvas tools including a whole-definition wiring graph; sessions default to Sonnet 5 at high reasoning effort.',
    ],
    media: [
      {
        src: '/media/tools/wireify/truss-from-json.png',
        alt: 'A roof truss generated from a JSON panel through one converted component, with named chord, vertical, and diagonal outputs',
        caption: 'A roof truss from a JSON panel, through one converted component — named chord, vertical, and diagonal outputs.',
      },
      {
        src: '/media/tools/wireify/height-input-question.png',
        alt: 'Claude asks how to treat a Panel-fed height input before writing any code',
        caption: 'Claude asks how to treat a Panel-fed height input before writing any code.',
      },
      {
        src: '/media/tools/wireify/brick-wall-session.png',
        alt: 'Claude reports the traced upstream chain and the user’s answers before building',
        caption: 'The traced upstream chain and the user’s decisions, reported before the build.',
      },
    ],
    repo: 'https://github.com/ifylab/wireify',
    license: 'Apache-2.0',
    links: [{ label: 'Food4Rhino', href: 'https://www.food4rhino.com/en/app/wireify' }],
  },
  'robotic-constructability': {
    summary: [
      'Robotic Constructability is an interactive explorer for 999 simulated designs of a robotically assembled cross-laminated timber (CLT) house — the open-source companion to a peer-reviewed study in Automation in Construction (2026).',
      'Every design is scored on four objectives — embodied carbon, mobile-robot travel time, and how comfortably a robotic arm places the wall and roof panels — plus two practicalities: CLT master-sheet demand and assembly steps needing temporary support. Set your own priorities and the top designs re-rank live; scatter and parallel-coordinate views carry the live Pareto front, and every filter follows you across tabs.',
    ],
    highlights: [
      'Live Pareto front on any score pair — dominated designs dimmed, drag to filter, click a dot for its design card with the isometric render.',
      'Question-phrased priority sliders re-rank all 999 designs as you drag; a shared link reproduces the exact ranking.',
      'Every metric named for humans, with the paper’s terms and definitions one tab away; correlations are computed live from the shipped dataset.',
      'Runs entirely in the browser from a static bundle — the dataset and renders are the study’s own research artifacts, reused as-is.',
    ],
    media: [
      {
        src: '/media/tools/robotic-constructability/summary.png',
        alt: 'Summary view: six priority sliders with verbal levels beside live top-design cards with renders and score bars',
        caption: 'Priority sliders with verbal levels; the top designs re-rank live as you drag.',
      },
      {
        src: '/media/tools/robotic-constructability/explore.png',
        alt: 'Explore view: embodied carbon against roof robot-friendliness with the live Pareto front and an open design card',
        caption: 'Any two scores plotted with the live Pareto front; a click opens the design card.',
      },
      {
        src: '/media/tools/robotic-constructability/gallery.png',
        alt: 'Gallery view: a grid of isometric CLT house renders sorted by embodied carbon',
        caption: 'All renders in one sortable grid.',
      },
    ],
    repo: 'https://github.com/goldsmith323/Robotic-Constructability',
    license: 'Apache-2.0',
    links: [
      { label: 'Open full screen', href: 'https://constructability.ifylab.dev' },
      { label: 'The paper', href: 'https://doi.org/10.1016/j.autcon.2025.106637' },
      { label: 'Dissertation', href: 'https://etda.libraries.psu.edu/catalog/26038szz188' },
    ],
    app: { src: 'https://constructability.ifylab.dev' },
  },
  halo: {
    summary: [
      'A Grasshopper definition running as a web page, built by Wireify 0.3. Claude read the definition on the live canvas, rewrote the wired chain as one Python component, and built this companion app for it. The app was then ported to run with no Rhino behind it. The definition is HALO, a tensegrity hollow-rope study from a 2021 manuscript, and everything below solves in your browser.',
    ],
    cta: [
      { label: 'Get Wireify on Food4Rhino', href: 'https://www.food4rhino.com/en/app/wireify' },
      { label: 'How Wireify works', href: '/tools/wireify' },
    ],
    license: 'Apache-2.0',
    app: { src: '/apps/halo', full: 'https://halo.ifylab.dev' },
  },
}
