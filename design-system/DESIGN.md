# .ify design — system notes

The design context for the .ify system: the decisions a contributor should hold in mind. It is deliberately opinionated. The goal is a system that reads as the work of a computational designer, not as generic, templated UI.

## The scene

An architect's drafting desk at dusk: cool slate-teal linework on pale paper, a single teal plug-light on the bench, and the last warm light of a sunset caught at the edges. Light by default; a darker "canvas at night" theme is available, never assumed.

## Color

- Every color is authored in **OKLCH**, derived from a six-swatch palette: slate-teal `#3E5153`, teal `#416F6F` (the accent dot), sage `#628276`, olive-sage `#9D9E81`, cream `#FCEED7`, and gold `#FFD195`.
- The cool teals and sages carry the structure (ink, lines, wires) and the teal is the single accent. The **warm pair (cream + gold) are accents only** — highlights, the hero, a "hot" wire — never the page background, which stays a near-white cool tint. (A warm cream/beige body background is the current generic-UI tell.)
- Neutrals are tinted toward the teal hue at very low chroma, never warmed into cream or beige.
- Text meets contrast floors: body at least 4.5:1, large text at least 3:1. No light-gray text "for elegance," and no gray text on colored backgrounds.

## Type

- Display: **Jost** at light weights — a geometric Futura-style face (the Century-Gothic look), OFL and bundle-safe. Secondary display is **Archivo** (swap the `--ify-font-display` token to switch).
- Text: **Hanken Grotesk** — a humanist grotesque that stays airy at reading sizes.
- Mono: **Commit Mono**, with **Fragment Mono** for thin data and labels — the computational signal.
- Display headings cap near 6rem via `clamp()`; display tracking never tighter than -0.04em. Reading measure 65–75ch.

## The wire — the one signature

The brand lives in a single bold element: the wire. Everything else stays quiet so the wire reads. A wire is a cubic Bezier between two circular sockets with both control points pushed down, so it sags like a hanging cable; the sag grows with the span. Resting wires are neutral; an active or hovered wire takes the accent. Sockets are open circles, like the input and output grips on a Grasshopper component.

## Motion

- Motion is part of the build, not decoration. Ease out with exponential curves; no bounce, no elastic.
- Keep it disciplined — too much movement reads as noise. The wires breathe and reroute with intent, not constantly.
- Every animation has a `prefers-reduced-motion` resting state: the wire field settles into a still, print-like composition.

## Layout

- Cards are a last resort, never nested. Prefer real structure — a wired canvas, an indexed list — over a grid of boxes.
- Borders are hairlines; depth comes from spacing and a single light source, not heavy outlines.
- Spacing follows the scale in `tokens.json`; vary it for rhythm.

## Guardrails

- No thick one-sided accent borders, no gradient-filled text, no glassmorphism by default.
- No grids of identical boxes, and no decorative numbered-section markers; let real content carry structure.
- Nothing overflows its container — the viewport edge is part of the composition.
- The teal accent is intentional; treat it as the brand.
