// SPDX-License-Identifier: Apache-2.0
// The real About content. `profiles` is the icon row under the bio (GitHub, Scholar,
// LinkedIn, ResearchGate). The bus `sections` thread Selected work (each entry links to its
// real source — thesis page, repo, workshop page, DOI; some carry a `secondary` link, and an
// optional `logo` can be dropped in later via /media/work/), Experience, Education, and Skills
// (grouped categories, no levels). Contact stays on ifylab.dev (ify@): no personal email here.
import type { AboutProfile, AboutSection } from '@ifylab/design-system'

export const profiles: AboutProfile[] = [
  { label: 'GitHub', href: 'https://github.com/goldsmith323', icon: 'github' },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=ZhTyJ2EAAAAJ&hl=en',
    icon: 'scholar',
  },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hosseinzargar/', icon: 'linkedin' },
  { label: 'ResearchGate', href: 'https://www.researchgate.net/profile/Hossein-Zargar-4', icon: 'researchgate' },
]

export const sections: AboutSection[] = [
  {
    kind: 'work',
    title: 'Selected work',
    items: [
      {
        title: 'Agentic data orchestration in design workflows',
        meta: 'Workshop, Advances in Architectural Geometry (MIT) · 2025',
        index: '01',
        href: 'https://github.com/goldsmith323/rhino_gh_mcp',
        secondary: { label: 'Workshop page', href: 'https://www.aag2025.com/workshop-1' },
      },
      {
        title:
          'Design exploration of robotically assembled cross-laminated timber houses with sequential path planning',
        meta: 'Automation in Construction · 2026',
        index: '02',
        href: 'https://doi.org/10.1016/j.autcon.2025.106637',
      },
      {
        title: 'Incorporating Robotic Constructability in Computational Design Optimization',
        meta: 'Ph.D. dissertation, Penn State · 2024',
        index: '03',
        href: 'https://etda.libraries.psu.edu/catalog/26038szz188',
        secondary: { label: 'Repository', href: 'https://github.com/goldsmith323/Robotic-Constructability' },
      },
      {
        title: 'Agent-based modelling for early-stage optimization of spatial structures',
        meta: 'International Journal of Architectural Computing · 2023',
        index: '04',
        href: 'https://doi.org/10.1177/14780771221143493',
      },
      {
        title: 'Deep learning in early-stage structural performance prediction',
        meta: 'IASS Symposium, Guilford · 2021',
        index: '05',
        href: 'https://www.ingentaconnect.com/content/iass/piass/2020/00002020/00000019/art00007',
      },
    ],
  },
  {
    kind: 'experience',
    title: 'Experience',
    items: [
      { role: 'AI Developer II', org: 'Walter P Moore', years: '2025 — present' },
      { role: 'AI Developer', org: 'Walter P Moore', years: '2024 — 2025' },
      { role: 'Data Science Intern', org: 'Walter P Moore', years: '2022 — 2024' },
      { role: 'Research Assistant', org: 'Penn State University', years: '2021 — 2024' },
    ],
  },
  {
    kind: 'experience',
    title: 'Education',
    items: [
      { role: 'Ph.D., Architectural Engineering', org: 'Penn State University', years: '2021 — 2024' },
      { role: 'M.Sc., Architectural Technology & Digital Design', org: 'University of Tehran', years: '2016 — 2019' },
      { role: 'B.Sc., Civil Engineering', org: 'University of Tehran', years: '2011 — 2016' },
    ],
  },
  {
    kind: 'skills',
    title: 'Skills',
    groups: [
      {
        label: 'ML & optimization',
        icon: 'waypoints',
        context:
          'Training and tuning models, with multi-objective and black-box search over large design spaces.',
        items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'pymoo', 'Optuna', 'surrogate models'],
      },
      {
        label: 'LLMs & agents',
        icon: 'bot',
        context: 'Building and evaluating agentic LLM workflows for design and performance decisions.',
        items: ['prompt engineering', 'MCP / agentic workflows', 'evaluation & guardrails'],
      },
      {
        label: 'AEC & geometry',
        icon: 'box',
        context: 'Parametric modeling and structural analysis across the Rhino and Grasshopper ecosystem.',
        items: ['Rhino / Grasshopper', 'Rhino.Compute', 'Karamba3D', 'Kangaroo', 'IFC / mesh pipelines', 'Revit / Dynamo'],
      },
      {
        label: 'Full-stack & APIs',
        icon: 'server',
        context: 'Shipping the services and interfaces that put these models in front of users.',
        items: ['Python', 'FastAPI', 'Flask', 'React', 'Docker', 'CI/CD', 'pytest'],
      },
      {
        label: 'Data & cloud',
        icon: 'database',
        context: 'Moving, storing, and visualizing the data these workflows run on.',
        items: ['pandas / NumPy / SciPy', 'Parquet', 'Plotly', 'MongoDB', 'SQL', 'AWS S3'],
      },
    ],
  },
]
