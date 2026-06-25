# .ify design system

The shared visual language for everything .ify ships — the site, repository READMEs, and tool interfaces. It provides design tokens (color, type, spacing, motion) as framework-neutral CSS custom properties, plus a small React component kit. One element carries the brand: the *wire* — the curved socket-to-socket connector that anyone who has used Rhino/Grasshopper will recognize at a glance.

Apache 2.0.

## What's inside

- `tokens/tokens.json` — the source of truth for every design decision, in OKLCH. Compiled to CSS custom properties and typed TypeScript by `tokens/build.mjs`.
- `src/foundation/` — the compiled tokens (`tokens.css`, `tokens.ts`), font faces (`fonts.css`), and brand references.
- `src/wire/` — the wire motif: a pure geometry function (`wirePath`), socket primitives, and an animated `WireField`.
- `src/components/` — the component kit, added as components are pulled from the design canvas.

## Using the tokens

Import the framework-neutral layer once, anywhere — a site, a README preview, a tool UI:

```css
@import "@ifylab/design-system/fonts.css";
@import "@ifylab/design-system/tokens.css";
```

Then read the variables:

```css
.button {
  background: var(--ify-accent);
  color: var(--ify-on-accent);
  font-family: var(--ify-font-text);
}
```

The whole palette is derived from the .ify palette — cool teals and sages with a teal accent dot and warm cream/gold highlights — so a single change in `tokens.json` re-themes every surface.

## The wire motif

A wire is a cubic Bezier drawn between two sockets, with both control points pushed down so it sags like a hanging cable. It is decorative, not an editor. See `src/wire/wirePath.ts` and `DESIGN.md`.

## Development

```bash
npm install
npm run tokens     # compile tokens.json -> src/foundation/{tokens.css,tokens.ts}
npm run dev        # preview the foundation + wire field
npm test           # run the unit tests
npm run build      # build the library + type declarations
```

## License

Apache 2.0. See the repository root `LICENSE` and `NOTICE`.
