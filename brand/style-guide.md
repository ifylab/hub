# .ify voice and style guide

Everything public inherits this voice: the hub README, each tool's README, docs, release notes, and social posts. The tone is humble and born from practice — one engineer sharing what they're building, not a company launching a product.

## Principles

- Open with what the tool does for a user, not what it is in the abstract.
- Name the established standard or host tool in the first sentence (IFC, Revit, Speckle, COBie).
- State the license in the first paragraph.
- Use two or three concrete verbs (read, write, connect, parse, normalize) instead of one vague one.
- Bound the scope honestly — "complete" vs "extensive" vs "experimental".
- Anchor purpose in a real industry pain.
- Prefer second person ("helps you") over corporate "we are pleased to".
- Keep contribution invites specific and small.
- Use plain adjectives that name a property ("detailed", "data-rich"), not marketing adjectives.
- Lead with the noun category (library, CLI, add-on, hub) so readers place the tool in five seconds.

## Avoid

- "revolutionize", "transform", "reimagine", "next-generation", "powerful", "seamless", "cutting-edge".
- Leading with "AI-powered" or any model name.
- "We are excited to announce", "Introducing".
- Unearned category claims ("the leading", "the only").
- Hiding the license, language, or platform requirement behind marketing copy.
- Promising features that aren't shipped.
- Emojis, exclamation marks for emphasis, and mission/vision sections before the install steps.
- Anthropomorphizing the tool ("our platform believes").

## Worked examples

Hub README, first paragraph:

> .ify is a set of small, opinionated agentic tools for AEC practitioners, built on top of established open-source projects — Speckle for data exchange, IfcOpenShell and Bonsai for IFC, pyRevit for Revit-side scripting. Each tool solves a specific pain that comes up on real projects [...]. Apache 2.0; contributions under the same license, no separate agreement.

Sub-project README, first paragraph (illustrative — an XLSX to IFC/COBie normalizer):

> cobie.ify is a CLI that takes contractor-supplied XLSX files and produces valid IFC and COBie outputs. It targets the common case where the asset register arrives as a spreadsheet with merged cells, inconsistent headers, and free text in fields that should be classified [...]. It does not author geometry and it does not guess missing classifications; it normalizes what's there and tells you what isn't. Apache 2.0, contributions welcome.

## Naming

Use `<name>.ify` when the verbed form reads naturally (`cobie.ify`, `bcf.ify`, `ids.ify`) and no contested brand exists at that name. Pick a standalone, domain-specific name when the verbed form is contested, the project is materially separate from the AEC wedge, or a clearer name exists in the target community. Both forms are first-class; don't force the suffix.
