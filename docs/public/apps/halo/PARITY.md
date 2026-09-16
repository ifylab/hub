# HALO standalone - parity against the live definition

Generated 2026-09-13T19:47:35.188Z by `parity.mjs`.

States checked: **9** · comparisons: **99** · failures: **0**

Method: each state is pushed into the live Grasshopper definition through the Wireify
app API, the solved frame is read back, and every view is compared against `solve()`
running in node. Numeric samples must agree to a relative 1e-6; text rows must match
exactly; geometry is compared by item count and bounding box, because Rhino builds
pipe surfaces and the port builds its own tube meshes (see README.md).

| view | states | worst deviation | verdict |
|---|---|---|---|
| `node_count` | 9 | exact | PASS |
| `member_count` | 9 | exact | PASS |
| `total_length` | 9 | exact | PASS |
| `overall_length` | 9 | exact | PASS |
| `inner_opening` | 9 | exact | PASS |
| `min_clearance` | 9 | exact | PASS |
| `collisions` | 9 | exact | PASS |
| `members` | 9 | exact | PASS |
| `families` | 9 | exact | PASS |
| `metrics` | 9 | exact | PASS |
| `assembly_bounds` | 9 | 2.33e-3 | PASS |

## States

- ok — `6-gon R4 L5 n5 s0.98 r0.188`
- ok — `3-gon R1 L1 n2 s0.5 r0.01`
- ok — `10-gon R10 L10 n20 s2 r1`
- ok — `5-gon R4 L6 n5 s1.1 r0.1`
- ok — `6-gon R4 L5 n12 s0.98 r0.188`
- ok — `7-gon R3 L3 n4 s1.5 r0.05`
- ok — `4-gon R8 L2 n8 s0.75 r0.3`
- ok — `9-gon R6 L7 n3 s1.25 r0.4`
- ok — `3-gon R5 L4 n1 s1 r0.2`
