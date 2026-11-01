# HALO — tensegrity hollow-rope, in the browser

A parametric tensegrity "hollow rope": rings of struts and cables woven along an axis, with
a clear void down the middle. Move the six inputs and the model, the key figures, the
clearance check and the section/elevation drawings all re-solve, in the browser, with no
Rhino, no Grasshopper and no Wireify.

## Where it came from

HALO.gh is an early form study from the 2021 manuscript (Zargar and Alaghmandan, "HALO:
Interactive Equilibrium Approach in Designing Tensegrity Hollow-Rope Structures", Journal of
Architectural Engineering 27(3), 04021026). Wireify 0.3 connected Claude to it inside
Grasshopper: Claude read the live canvas, rewrote the wired chain as one Python component,
and built this page as the definition's companion app. The page was then taken away from
Rhino by rewriting that component's geometry in JavaScript.

## The generator

`solve.js` began as a line-for-line transcription of that component, checked against the
live definition. It has since been corrected and is now the reference for this page.

HALO.gh was a five-sided study. It turned the middle ring a fixed 180 degrees, reached the
X-cable joints by fixed index offsets, and did not wrap those offsets round the ring. So it
built the manuscript's module only at five sides, and there it matched except for 24
X-cables at the ring's seam. The generator builds the manuscript's module (Figs. 3 and 6) at
every side count:

- the middle ring sits half a side round from the end rings;
- a diagonal strut runs one side round, end ring to end ring;
- a secondary strut runs a side and a half the other way, end ring to middle ring, and
  again middle ring to the next end ring;
- X-cables tie every end-ring joint to the two nearest joints of each middle ring beside it.

At five sides every strut is HALO.gh's and every X-cable HALO.gh has is kept. HALO.gh stays
as the early study, so the two no longer match.

## The clearance check

Geometric, not structural: there are no loads and no form finding on this page. A rope is
not walkable when

- two struts that share no joint come closer than two strut radii, centre to centre;
- a cable passes a strut it is not tied to closer than a strut radius plus a cable radius; or
- the middle closes up.

Members that meet at a joint overlap near it by their own thickness. That is the joint's
detail, not a clash; the 3D view draws a sphere at every joint and starts each cable at its
surface. The cable radius the check uses is the one the 3D view draws.

## Running it

The page is ES modules, so it needs a server rather than `file://`:

```
python -m http.server 8000      # or: npx serve .
```

Then open `http://localhost:8000/`.

For embedding (the contract ifylab.dev uses):

- `?embed=1` hides the theme toggle and the footer
- the host page may set the theme with
  `postMessage({ type: "ify:theme", mode: "dark" }, "*")`, accepted **only** from
  `https://ifylab.dev`, `http://localhost:4321` and the site's Cloudflare branch previews

## What is in here

| file | what it is |
|---|---|
| `index.html` | the page |
| `solve.js` | the generator and the clearance check |
| `shim.js` | the local `app` object — the kit's contract, backed by `solve.js` |
| `snapshot.js` | control values, ranges, steps and labels, captured from a live frame |
| `manifest.json` | the controls' labels and help |
| `theme.css` | the page's theme layer |
| `kit/` | the Wireify app kit, synced from the Wireify tree and never edited here |
| `HALO.gh` | the early form study after the conversion: an ordinary Python 3 script component, so it opens in stock Rhino 8 with nothing installed |

The kit is newer than the Wireify 0.3.0 release: its top, front and side views are flat
(orthographic), and it draws markers as instanced smooth spheres. Both land in the next
Wireify release.

## Units

Metres throughout. HALO.gh's Grasshopper document is set to millimetres, but the model was
drawn in metres at the manuscript's scale (a 20 m rope of 5 m modules), so the page reads
metres.

## Licence

Apache-2.0, as the tool is. The vendored three.js and the three OFL fonts under `kit/` carry
their own notices in `kit/vendor/NOTICE-three.txt` and `kit/NOTICE-fonts.txt`.
