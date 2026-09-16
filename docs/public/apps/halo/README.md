# HALO — tensegrity hollow-rope, standalone

A parametric tensegrity "hollow rope": rings of struts and cables woven along an axis, with
a clear void down the middle. Move the six inputs and the model, the key figures, the
clearance check and the section/elevation drawings all re-solve.

**This folder runs with no Rhino, no Grasshopper and no Wireify.** It is the same app as the
live one — the same shipped kit, the same page, the same widgets and the same 3D viewport —
with only its data layer swapped: where the live app asks Grasshopper to solve, this solves
in the browser.

## The brief it was built from

> Reverse-engineer this definition into ONE self-contained Python component driven by
> `in1`, `in2`, `in3`. Keep the core pure math — plain vertex/index and polyline arrays, no
> RhinoCommon in the logic — and convert to Rhino geometry only at the very end. Output the
> geometry for display plus the key metrics. Then an app page on top, the whole thing
> runnable without the `.gh`.

That shape is what made this port honest rather than a rewrite: the Grasshopper component's
geometric core already worked on plain tuples and integer index pairs, so `solve.js` is a
transcription of it, not a reinterpretation.

## Running it

The page is ES modules, so it needs a server rather than `file://`:

```
cd standalone
python -m http.server 8000      # or: npx serve .
```

Then open `http://localhost:8000/`.

For embedding (the contract ifylab.dev uses):

- `?embed=1` hides the theme toggle and the footer
- the host page may set the theme with
  `postMessage({ type: "ify:theme", mode: "dark" }, "*")`, accepted **only** from
  `https://ifylab.dev` or `http://localhost:4321`

## What is in here

| file | what it is |
|---|---|
| `index.html` | the live app's page, unchanged except its import and one call |
| `kit/` | the shipped Wireify app kit, **copied verbatim and never edited** |
| `theme.css` | the app's own theme layer, as on the live page |
| `shim.js` | the local `app` object — the kit's contract, backed by `solve.js` |
| `solve.js` | the port of the definition's logic |
| `snapshot.js` | control values, ranges, steps and labels captured from a LIVE frame |
| `snapshot.json` | the full captured frame, including a live geometry payload |
| `parity.mjs` | drives the live definition and diffs it against `solve.js` |
| `PARITY.md` | the result of that run |

The page's only edits are the ones the swap requires: `connect()` became
`local({ homeId })` from `shim.js`, the viewport binder became the local one, the baked
report is hidden, and a small block adds the embed contract and the standalone pill label.
Nothing in `kit/` was touched.

## Parity

**9 states, 99 comparisons, 0 failures** — see `PARITY.md`. Every numeric and text view is
not merely within tolerance but **exact**: node and member counts, `total_length`,
`overall_length`, `inner_opening`, `min_clearance`, `collisions`, all member rows, the
families table and all 18 metrics lines match the live Grasshopper output character for
character, across states including every slider's extremes.

Re-run it any time against a live definition:

```
node parity.mjs <app-token>      # HALO.gh must be the front Grasshopper tab
```

## What did NOT port

Written down rather than stubbed silently. The first four come from the session that wrote
the Python component and are inherited by this port.

**1. Pipe geometry is rebuilt, not reproduced.** The component calls RhinoCommon's
`Brep.CreatePipe` to turn each strut axis into a pipe surface. That is not available in a
browser. `solve.js` builds its own 24-sided tube per strut. The parity run drew it as the
live payload does (50 vertices, 48 triangles per strut); the page now draws each strut as a
hollow steel section, the same outer wall plus an inner wall and ring ends in one mesh, so
item counts and bounds still agree while vertex counts do not. Vertex positions differ
from the live payload by the seam's starting angle, and the bounding box differs by the
tessellation. Parity therefore checks geometry by item count and bounds,
with an allowance of 1.5× the port's sagitta, `r·(1−cos(π/24))`. Worst observed across the
sampled states: 1.21× — well inside it. **The strut axes, which is what the engineering
depends on, are exact.**

**2. Duplicate-line removal is unverified.** The original definition used a compiled
`removeDuplicateLines` component whose source cannot be read. Its rule was inferred as
unordered-endpoint dedup at document tolerance from its name and I/O signature, and on
every reachable state it removed 0 of 56 lines — so the real behaviour was never observed.
The Python component reproduces the inferred rule and this port reproduces the Python.
Treat all dedup behaviour as unverified in both.

**3. Six native-component semantics were recovered from solved output, not stored values.**
`introspect_component` does not expose the persistent values of unwired inputs, so the
Polygon default plane, Rotate's 90° about −Y, Weave's `{0,1}` pattern, Cull Index −1, which
Polygon Center output feeds Scale, and Pipe's caps/fit-rail were each read back out of the
solved geometry. They are consistent with every state checked, but they are inferences.

**4. Three hidden inputs are pinned, not live.** The component reads
`ModelAbsoluteTolerance` (node merging, pipe tolerance, and the test that picks the wording
of the metrics family lines), `ModelAngleToleranceRadians`, and `GetUnitSystemName` from the
Rhino document. No canvas control moves them, so changing document units or tolerance in
Rhino moves the outputs with nothing visibly changing. `solve.js` pins them to the captured
document's values (`tol 0.001`, 1°, "Millimeter") in its `DOC` export. Change them there if
you re-host from a document with different settings.

**5. The baked HTML report is unavailable here.** The kit's report exporter fetches
`/app/<home>/api/state` and the kit assets by absolute path, both of which require the live
server. The page carries no save-report action.

**6. `inner_opening`, `min_clearance` and `collisions` are not from HALO.gh.** They were
added when the single Python component was written, as geometric measurements of the
generated form. They are not ported behaviour from the original definition, and — as the
page says — they are geometric checks, **not force-density results**. This definition has no
form-finding stage.

**7. `module_count = 1` is a thin path.** No mid rings and no struts exist at that setting,
and `min_clearance` returns a −1.0 sentinel. It solves in both implementations and parity
covers it, but it was never exercised on the original canvas.

## Units

The Grasshopper document is set to **Millimeters** with a document tolerance of 0.001, and
the solver's text rows keep that word so parity stays exact. The model itself was drawn in
metres, at the manuscript's own scale (a 20 m rope of 5 m modules, struts of 0.19 m radius), so
the page labels every length in metres. Numbers are never converted.

## Licence

Apache-2.0, as the tool is. The vendored three.js and the three OFL fonts under `kit/` carry
their own notices in `kit/vendor/NOTICE-three.txt` and `kit/NOTICE-fonts.txt`.
