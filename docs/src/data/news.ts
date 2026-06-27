// SPDX-License-Identifier: Apache-2.0
// The .ify news feed: a small, hand-curated set of tools, libraries, and reading worth knowing.
// Every entry links to a real source. `date` is the publication date (month precision unless a
// release gives an exact day); it orders the feed and sets the RSS pubDate. `meta` is the human
// byline. Add new items at the top. Keep it honest: only real things, named plainly.

export interface NewsEntry {
  slug: string
  tag: string
  tagWarm?: boolean
  hot?: boolean
  title: string
  blurb: string
  meta: string
  /** Publication date (ISO; 'YYYY-MM' is fine). Orders the feed and sets the RSS pubDate. */
  date: string
  source?: string
  /** Short article body shown on the entry's page. */
  body?: string
}

export const categories = ['AI tools', 'Libraries', 'Reading']

export const entries: NewsEntry[] = [
  {
    slug: 'build123d-0-11-novtk',
    tag: 'Libraries',
    title: 'build123d v0.11.0 drops VTK dependency',
    blurb: 'The Python CAD library build123d switches to cadquery-ocp-novtk, removing VTK as a transitive dependency.',
    meta: 'via GitHub releases - gumyr/build123d - 2026-06-18',
    date: '2026-06-18',
    source: 'https://github.com/gumyr/build123d/releases/tag/v0.11.0',
    body: 'build123d v0.11.0 swaps its underlying OCC binding from cadquery-ocp to cadquery-ocp-novtk, cutting VTK out of the dependency tree entirely. For headless installs, CI pipelines, and server-side geometry work, this removes a large and sometimes troublesome transitive package. Users running certain Jupyter-based visualisation workflows will need to reinstall VTK separately. The change is otherwise a drop-in upgrade.',
  },
  {
    slug: 'build123d-0-11',
    tag: 'Libraries',
    hot: true,
    title: 'build123d 0.11.0 — parametric CAD in plain Python',
    blurb:
      'A code-first CAD framework on the OpenCASCADE kernel, with a clean Pythonic API for precise, manufacturable models.',
    meta: 'via PyPI — pypi.org/project/build123d · Jun 2026',
    date: '2026-06-17',
    source: 'https://github.com/gumyr/build123d',
    body: 'build123d describes solid geometry as ordinary Python — context managers and operators rather than a chained fluent API — so parametric models are easy to read, diff, and script. It builds on the OpenCASCADE B-rep kernel and grew out of CadQuery. Version 0.11.0 is the current release.',
  },
  {
    slug: 'claude-tag-slack',
    tag: 'AI tools',
    title: 'Anthropic puts Claude in Slack with Claude Tag',
    blurb:
      'Invite Claude into a channel and @-tag it to hand off work — it runs asynchronously, keeps channel context, and follows up on its own.',
    meta: 'via Anthropic — anthropic.com · Jun 2026',
    date: '2026-06',
    source: 'https://www.anthropic.com/news/introducing-claude-tag',
    body: 'Claude Tag turns the assistant into a persistent teammate inside Slack: it breaks a request into steps, uses whatever tools it has been granted, and reports back in-thread. An ambient mode lets it flag things it thinks you need and schedule its own follow-ups. In beta for Team and Enterprise workspaces.',
  },
  {
    slug: 'bonsai-openbim-blender',
    tag: 'Libraries',
    title: 'Bonsai brings native OpenBIM authoring to Blender',
    blurb:
      'The IfcOpenShell-based add-on (formerly BlenderBIM) edits real IFC data directly inside Blender — no lossy round-trips.',
    meta: 'via bonsaibim.org — bonsaibim.org · 2026',
    date: '2026-06',
    source: 'https://bonsaibim.org/',
    body: 'Bonsai is a free, native IFC authoring tool built on the IfcOpenShell library, working on the IFC model itself rather than exporting to it. It is the open-source path to detailed, data-rich OpenBIM, maintained by a community of volunteers. Renamed from the BlenderBIM Add-on.',
  },
  {
    slug: 'aec-claude-skill-package',
    tag: 'AI tools',
    title: '73 deterministic Claude skills for the Blender AEC stack',
    blurb:
      'A community skill package spanning Blender, Bonsai, IfcOpenShell, and Sverchok — aimed at reliable, repeatable AEC Python code.',
    meta: 'via GitHub — github.com/Impertio-Studio · 2026',
    date: '2026-06',
    source:
      'https://github.com/Impertio-Studio/Blender-Bonsai-ifcOpenshell-Sverchok-Claude-Skill-Package',
    body: 'The package collects 73 task-specific skills across the open AEC toolchain — Blender, the IfcOpenShell and Bonsai BIM stack, and the Sverchok node editor — so an assistant produces code that runs the same way each time. It is MIT-licensed and maintained by Impertio Studio. A concrete look at skills applied to architecture and BIM work.',
  },
  {
    slug: 'mcp-2026-standard',
    tag: 'AI tools',
    title: 'The Model Context Protocol settles in as the integration standard',
    blurb:
      'A year on, MCP is the common way agents reach tools and data — adopted across the major vendors, with thousands of servers in production.',
    meta: 'via The New Stack — thenewstack.io · 2026',
    date: '2026-03',
    source: 'https://thenewstack.io/model-context-protocol-roadmap-2026/',
    body: 'MCP gives a model one consistent way to connect to external tools, data, and codebases instead of bespoke glue per integration. Through 2026 it has been adopted across the major model providers and moved toward neutral, community governance, with a roadmap focused on production scale. For anyone wiring agents into real systems, it is becoming the default plug.',
  },
  {
    slug: 'agent-skills-real-world',
    tag: 'Reading',
    title: 'Anthropic: "Equipping agents for the real world with Agent Skills"',
    blurb:
      'Why packaging procedural know-how as loadable skills beats stuffing it all into the prompt — and how progressive disclosure keeps context cheap.',
    meta: 'via Anthropic Engineering — anthropic.com · 2025',
    date: '2025-10',
    source:
      'https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills',
    body: 'Skills bundle instructions, scripts, and references that a model loads only when a task needs them, so an agent can carry deep capability without paying for it on every turn. The piece lays out progressive disclosure and where skills sit next to prompts and tools. Good grounding for building real agent capability.',
  },
  {
    slug: 'building-effective-agents',
    tag: 'Reading',
    title: 'Anthropic: "Building Effective Agents"',
    blurb:
      'The essay behind a lot of current practice — simple, composable patterns over heavy frameworks, with orchestrator-workers as the workhorse.',
    meta: 'via Anthropic Engineering — anthropic.com · 2024',
    date: '2024-12',
    source: 'https://www.anthropic.com/engineering/building-effective-agents',
    body: 'A clear, opinionated walk through when to reach for an agent at all, and which patterns actually earn their complexity — from prompt chaining to the orchestrator-workers split. Worth reading before adding a framework. Still a reference a year on.',
  },
]
