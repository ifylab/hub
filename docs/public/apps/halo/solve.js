// HALO - tensegrity hollow-rope module: the page's form generator.
//
// It began as a line-for-line port of W1_tensegrity_module.py, the Python component that
// HALO.gh's wired chain became. That chain was a five-sided study: it turned the middle
// ring a fixed 180 degrees, reached the X-cable joints by fixed index offsets and never
// wrapped those round the ring, so it built the manuscript's module only at five sides,
// and even there left 24 X-cables out at the seam. This file builds the manuscript's
// module at every side count (Zargar and Alaghmandan 2021, Figs. 3 and 6):
//   - the middle ring sits half a side round from the end rings;
//   - a diagonal strut runs one side round, end ring to end ring;
//   - a secondary strut runs a side and a half the other way, end ring to middle ring,
//     and again middle ring to the next end ring;
//   - X-cables tie every end-ring joint to the two nearest joints of each middle ring
//     beside it.
// At five sides every strut is HALO.gh's and every X-cable HALO.gh has is kept. HALO.gh
// stays as the early study; this generator is the page's reference.
//
// Lengths are metres. Joints merge within a millimetre, and the same millimetre decides
// whether a family's lengths read as one value in the metrics lines.
export const DOC = { tol: 0.001, unitName: "Meter" };

const MID_OFFSET_DIVISOR = 2.0;
const MID_TURN = 0.5; // the middle ring, in sides round from the end rings
// Cables have a body (a one-pixel line vanishes beside a strut): a share of the strut
// radius, with a floor so thin struts still show their net. The clearance check uses the
// same body, so what the 3D view shows and what the check measures agree.
const CABLE_SHARE = 0.16;
const CABLE_MIN = 0.012;
export const cableRadius = (strutR) => Math.max(strutR * CABLE_SHARE, CABLE_MIN);

// --- formatting helpers -----------------------------------------------------
// Python round() and %-formatting are round-half-even; JS toFixed is not. These mimic
// Python so the string outputs (families, members, metrics) compare exactly.

function roundHalfEven(x, nd) {
  if (!isFinite(x)) return x;
  const f = Math.pow(10, nd);
  const scaled = x * f;
  const r = Math.round(scaled);
  const out = Math.abs(scaled % 1) === 0.5 && r % 2 !== 0 ? r - Math.sign(scaled) : r;
  return out / f;
}

function fmt(x, nd) {
  const v = roundHalfEven(x, nd);
  // Keep negative zero. Python's %-formatting prints "-0.0000" for a tiny negative
  // value and the live component's member rows contain it; normalising it away made
  // every such row differ (16 parity failures across 8 states before this was fixed).
  if (Object.is(v, -0) || (v === 0 && x < 0)) return "-" + (0).toFixed(nd);
  return v.toFixed(nd);
}

function fmtG(x) {
  if (x === 0) return "0";
  return String(Number(x.toPrecision(6)));
}

// --- pure geometric core ----------------------------------------------------

class NodeRegistry {
  constructor(tolerance) {
    this.tol = tolerance;
    this.points = [];
    this._buckets = new Map();
  }
  _cell(p) {
    const t = this.tol;
    return [Math.floor(p[0] / t), Math.floor(p[1] / t), Math.floor(p[2] / t)];
  }
  index(p) {
    const c = this._cell(p);
    const t2 = this.tol * this.tol;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = this._buckets.get((c[0] + dx) + "," + (c[1] + dy) + "," + (c[2] + dz));
          if (!bucket) continue;
          for (const i of bucket) {
            const q = this.points[i];
            const d2 =
              (q[0] - p[0]) * (q[0] - p[0]) +
              (q[1] - p[1]) * (q[1] - p[1]) +
              (q[2] - p[2]) * (q[2] - p[2]);
            if (d2 <= t2) return i;
          }
        }
      }
    }
    const i = this.points.length;
    this.points.push(p);
    const key = c[0] + "," + c[1] + "," + c[2];
    if (!this._buckets.has(key)) this._buckets.set(key, []);
    this._buckets.get(key).push(i);
    return i;
  }
}

// One ring in the plane x = const, joint j at (j + turn) sides round from +Z.
function ringPoints(x, r, count, turn) {
  const step = (2.0 * Math.PI) / count;
  const pts = [];
  for (let j = 0; j < count; j++) {
    const a = (j + turn) * step;
    pts.push([x, r * Math.sin(a), r * Math.cos(a)]);
  }
  return pts;
}

// The closest pair of points between two segments: the same clamped parameters as
// segmentDistance, returned as the two points, so a clash can be marked WHERE the members
// meet.
function segmentClosest(p1, q1, p2, q2) {
  const d1 = [q1[0] - p1[0], q1[1] - p1[1], q1[2] - p1[2]];
  const d2 = [q2[0] - p2[0], q2[1] - p2[1], q2[2] - p2[2]];
  const r = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
  const a = d1[0] * d1[0] + d1[1] * d1[1] + d1[2] * d1[2];
  const e = d2[0] * d2[0] + d2[1] * d2[1] + d2[2] * d2[2];
  const f = d2[0] * r[0] + d2[1] * r[1] + d2[2] * r[2];
  const eps = 1e-12;
  let s;
  let t;
  if (a <= eps && e <= eps) {
    s = 0.0;
    t = 0.0;
  } else if (a <= eps) {
    s = 0.0;
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = d1[0] * r[0] + d1[1] * r[1] + d1[2] * r[2];
    if (e <= eps) {
      t = 0.0;
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2];
      const den = a * e - b * b;
      s = den > eps ? Math.max(0, Math.min(1, (b * f - c * e) / den)) : 0.0;
      t = (b * s + f) / e;
      if (t < 0.0) {
        t = 0.0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (t > 1.0) {
        t = 1.0;
        s = Math.max(0, Math.min(1, (b - c) / a));
      }
    }
  }
  return [
    [p1[0] + d1[0] * s, p1[1] + d1[1] * s, p1[2] + d1[2] * s],
    [p2[0] + d2[0] * t, p2[1] + d2[1] * t, p2[2] + d2[2] * t],
  ];
}

function segmentDistance(p1, q1, p2, q2) {
  const d1 = [q1[0] - p1[0], q1[1] - p1[1], q1[2] - p1[2]];
  const d2 = [q2[0] - p2[0], q2[1] - p2[1], q2[2] - p2[2]];
  const r = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
  const a = d1[0] * d1[0] + d1[1] * d1[1] + d1[2] * d1[2];
  const e = d2[0] * d2[0] + d2[1] * d2[1] + d2[2] * d2[2];
  const f = d2[0] * r[0] + d2[1] * r[1] + d2[2] * r[2];
  const eps = 1e-12;
  let s;
  let t;
  if (a <= eps && e <= eps) {
    s = 0.0;
    t = 0.0;
  } else if (a <= eps) {
    s = 0.0;
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = d1[0] * r[0] + d1[1] * r[1] + d1[2] * r[2];
    if (e <= eps) {
      t = 0.0;
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2];
      const den = a * e - b * b;
      s = den > eps ? Math.max(0, Math.min(1, (b * f - c * e) / den)) : 0.0;
      t = (b * s + f) / e;
      if (t < 0.0) {
        t = 0.0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (t > 1.0) {
        t = 1.0;
        s = Math.max(0, Math.min(1, (b - c) / a));
      }
    }
  }
  const cx = p1[0] + d1[0] * s - p2[0] - d2[0] * t;
  const cy = p1[1] + d1[1] * s - p2[1] - d2[1] * t;
  const cz = p1[2] + d1[2] * s - p2[2] - d2[2] * t;
  return Math.sqrt(cx * cx + cy * cy + cz * cz);
}

export function core(values) {
  const nSeg = values.segments === undefined ? 5 : Math.trunc(values.segments);
  const radius = values.module_radius === undefined ? 4.0 : Number(values.module_radius);
  const span = values.module_length === undefined ? 6.0 : Number(values.module_length);
  const ringCount = values.module_count === undefined ? 5 : Math.trunc(values.module_count);
  const scaleMid = values.mid_scale === undefined ? 1.1 : Number(values.mid_scale);
  const strutR = values.strut_radius === undefined ? 0.1 : Number(values.strut_radius);

  if (nSeg < 3) throw new Error("segments must be at least 3 (got " + nSeg + ")");
  if (radius <= 0) throw new Error("module_radius must be positive (got " + radius + ")");
  if (span <= 0) throw new Error("module_length must be positive (got " + span + ")");
  if (ringCount < 1) throw new Error("module_count must be at least 1 (got " + ringCount + ")");
  if (scaleMid <= 0) throw new Error("mid_scale must be positive (got " + scaleMid + ")");
  if (strutR <= 0) throw new Error("strut_radius must be positive (got " + strutR + ")");

  const tol = DOC.tol;
  const cableR = cableRadius(strutR);

  const mainRings = [];
  for (let i = 0; i < ringCount; i++) mainRings.push(ringPoints(i * span, radius, nSeg, 0.0));
  const midRings = [];
  for (let i = 0; i < ringCount - 1; i++) {
    midRings.push(ringPoints(span / MID_OFFSET_DIVISOR + i * span, radius * scaleMid, nSeg, MID_TURN));
  }

  const nodes = new NodeRegistry(tol);
  const mainIx = mainRings.map((r) => r.map((p) => nodes.index(p)));
  const midIx = midRings.map((r) => r.map((p) => nodes.index(p)));
  const nModules = midRings.length;
  // Every rule below wraps round the ring: a joint index past either end comes back in.
  const at = (ring, j) => ring[((j % nSeg) + nSeg) % nSeg];

  // Secondary (peripheral) cables: each end ring's own outline.
  const ringEdges = mainIx.map((r) => {
    const edges = [];
    for (let j = 0; j < nSeg; j++) edges.push([r[j], at(r, j + 1)]);
    return edges;
  });

  // Diagonal struts: end ring i joint j to end ring i+1 joint j+1, one side round.
  const diagonals = [];
  for (let i = 0; i < nModules; i++) {
    const run = [];
    for (let j = 0; j < nSeg; j++) run.push([mainIx[i][j], at(mainIx[i + 1], j + 1)]);
    diagonals.push(run);
  }

  // Secondary struts: a side and a half the other way, twice, so compression runs on
  // from one end ring through the middle ring to the next. Middle joint k sits at k + 1/2
  // sides, so joint j - 2 is 1.5 sides back from end joint j, and end joint k - 1 is 1.5
  // sides back from middle joint k.
  const secondaries = Array.from({ length: nModules }, () => []);
  for (let i = 0; i < nModules; i++) {
    for (let j = 0; j < nSeg; j++) secondaries[i].push([mainIx[i][j], at(midIx[i], j - 2)]);
    for (let k = 0; k < nSeg; k++) secondaries[i].push([midIx[i][k], at(mainIx[i + 1], k - 1)]);
  }

  // X-cables: each end-ring joint to the two nearest joints of the middle ring ahead
  // and of the middle ring behind, half a side either way (middle joints i and i - 1).
  // The two rules never produce the same pair, so there is nothing to de-duplicate.
  const xcables = Array.from({ length: nModules }, () => []);
  for (let p = 0; p < ringCount; p++) {
    for (const q of [p, p - 1]) {
      if (q < 0 || q >= nModules) continue;
      for (let i = 0; i < nSeg; i++) {
        xcables[q].push([mainIx[p][i], midIx[q][i]]);
        xcables[q].push([mainIx[p][i], at(midIx[q], i - 1)]);
      }
    }
  }

  const flat = (runs) => runs.reduce((acc, r) => acc.concat(r), []);
  const flatRings = flat(ringEdges);
  const flatDiagonals = flat(diagonals);
  const flatSecondaries = flat(secondaries);
  const flatXcables = flat(xcables);

  const FAMILY_SPECS = [
    ["ring", "secondary cables", "tension", flatRings],
    ["diag", "diagonal struts", "compression", flatDiagonals],
    ["sec", "secondary struts", "compression", flatSecondaries],
    ["xcable", "X-cables", "tension", flatXcables],
  ];

  const strutMembers = flatSecondaries.concat(flatDiagonals);
  const cableMembers = flatRings.concat(flatXcables);
  const allMembers = flatDiagonals.concat(flatSecondaries, flatRings, flatXcables);

  const memberLength = (pair) => {
    const a = nodes.points[pair[0]];
    const b = nodes.points[pair[1]];
    return Math.sqrt(
      (a[0] - b[0]) * (a[0] - b[0]) +
        (a[1] - b[1]) * (a[1] - b[1]) +
        (a[2] - b[2]) * (a[2] - b[2])
    );
  };

  const axisDistance = (pair) => {
    const a = nodes.points[pair[0]];
    const b = nodes.points[pair[1]];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const den = dy * dy + dz * dz;
    const t = den <= 0 ? 0.0 : Math.max(0, Math.min(1, -(a[1] * dy + a[2] * dz) / den));
    const y = a[1] + t * dy;
    const z = a[2] + t * dz;
    return Math.sqrt(y * y + z * z);
  };

  // A member's span along the rope, for pruning: two members whose spans sit further
  // apart than both the clash limit and the closest approach so far can change neither.
  const spanOf = (pr) => {
    const pa = nodes.points[pr[0]];
    const pb = nodes.points[pr[1]];
    return [Math.min(pa[0], pb[0]), Math.max(pa[0], pb[0]), pr[0], pr[1], pa, pb];
  };
  const midpoint = (cp) => [(cp[0][0] + cp[1][0]) / 2, (cp[0][1] + cp[1][1]) / 2, (cp[0][2] + cp[1][2]) / 2];
  const shareJoint = (a, b) => a[2] === b[2] || a[2] === b[3] || a[3] === b[2] || a[3] === b[3];

  // Struts that share no joint, closer than two strut radii: they cut into each other.
  // Members meeting at a joint overlap near it by their own thickness; that is the joint's
  // detail, not a clash.
  function strutClearance(pairs, limit) {
    const items = pairs.map(spanOf);
    // Sort a permutation, not the items, so a hit can name its struts by their index in
    // `pairs` (the page marks those in the 3D view - the manuscript's own Collision message).
    const order = items.map((_, k) => k);
    order.sort((u, v) => items[u][0] - items[v][0]);
    const sorted = order.map((k) => items[k]);
    const clash = new Set();
    const points = [];
    let best = null;
    let hits = 0;
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const gap = sorted[j][0] - sorted[i][1];
        if (gap >= limit && best !== null && gap >= best) break;
        if (shareJoint(sorted[i], sorted[j])) continue;
        const d = segmentDistance(sorted[i][4], sorted[i][5], sorted[j][4], sorted[j][5]);
        if (best === null || d < best) best = d;
        if (d < limit) {
          hits++;
          clash.add(order[i]);
          clash.add(order[j]);
          points.push(midpoint(segmentClosest(sorted[i][4], sorted[i][5], sorted[j][4], sorted[j][5])));
        }
      }
    }
    return [best, hits, clash, points];
  }

  // Cables that pass through a strut they are not tied to: axes closer than a strut
  // radius plus a cable radius. A rope with any is not walkable, exactly as a strut clash.
  function cableClearance(cables, struts, limit) {
    const strutSpans = struts.map(spanOf);
    const points = [];
    let best = null;
    let hits = 0;
    for (const pr of cables) {
      const c = spanOf(pr);
      for (const s of strutSpans) {
        const gap = Math.max(s[0] - c[1], c[0] - s[1], 0);
        if (gap >= limit && best !== null && gap >= best) continue;
        if (shareJoint(c, s)) continue;
        const d = segmentDistance(c[4], c[5], s[4], s[5]);
        if (best === null || d < best) best = d;
        if (d < limit) {
          hits++;
          points.push(midpoint(segmentClosest(c[4], c[5], s[4], s[5])));
        }
      }
    }
    return [best, hits, points];
  }

  // The clear void about the axis: every member takes its own radius off the opening.
  let opening = null;
  for (const pair of strutMembers) {
    const d = axisDistance(pair) - strutR;
    if (opening === null || d < opening) opening = d;
  }
  for (const pair of cableMembers) {
    const d = axisDistance(pair) - cableR;
    if (opening === null || d < opening) opening = d;
  }
  const innerOpening = roundHalfEven(Math.max(0.0, opening === null ? 0.0 : opening), 6);

  const cl = strutClearance(strutMembers, 2.0 * strutR);
  const clearance = cl[0];
  const collisions = cl[1];
  const collidingStruts = cl[2];
  const clashPoints = cl[3];
  const minClearance = clearance === null ? -1.0 : roundHalfEven(clearance, 6);

  const cc = cableClearance(cableMembers, strutMembers, strutR + cableR);
  const cableHits = cc[1];
  const cableClashPoints = cc[2];
  const cableClear = cc[0] === null ? -1.0 : roundHalfEven(cc[0], 6);

  const usedIx = Array.from(new Set(allMembers.reduce((a, p) => a.concat(p), []))).sort(
    (a, b) => a - b
  );
  const used = usedIx.map((i) => nodes.points[i]);
  const extents = [0, 1, 2].map((k) => [
    Math.min.apply(null, used.map((p) => p[k])),
    Math.max.apply(null, used.map((p) => p[k])),
  ]);
  const overallLength = roundHalfEven(extents[0][1] - extents[0][0], 6);

  const families = FAMILY_SPECS.map((spec) => {
    const key = spec[0];
    const label = spec[1];
    const role = spec[2];
    const pairs = spec[3];
    if (!pairs.length) return key + "|" + label + "|" + role + "|0|0|0|0";
    const lengths = pairs.map(memberLength);
    const sum = lengths.reduce((a, b) => a + b, 0);
    return (
      key + "|" + label + "|" + role + "|" + pairs.length + "|" +
      fmt(Math.min.apply(null, lengths), 4) + "|" +
      fmt(Math.max.apply(null, lengths), 4) + "|" +
      fmt(sum, 4)
    );
  });

  const rowOrder = [];
  for (let m = 0; m < nModules; m++) {
    rowOrder.push(["ring", ringEdges[m]]);
    rowOrder.push(["diag", diagonals[m]]);
    rowOrder.push(["sec", secondaries[m]]);
    rowOrder.push(["xcable", xcables[m]]);
  }
  rowOrder.push(["ring", ringEdges[ringCount - 1]]);

  const members = [];
  for (const row of rowOrder) {
    const family = row[0];
    for (const pair of row[1]) {
      const a = nodes.points[pair[0]];
      const b = nodes.points[pair[1]];
      members.push(
        family + "," + fmt(a[0], 4) + "," + fmt(a[1], 4) + "," + fmt(a[2], 4) + "," +
        fmt(b[0], 4) + "," + fmt(b[1], 4) + "," + fmt(b[2], 4)
      );
    }
  }

  const nodeCount = nodes.points.length;
  const memberCount = allMembers.length;
  const totalLength = roundHalfEven(
    allMembers.reduce((s, m) => s + memberLength(m), 0),
    6
  );

  const groupLine = (label, pairs) => {
    if (!pairs.length) return "  " + label + ": none";
    const lengths = pairs.map(memberLength);
    const lo = Math.min.apply(null, lengths);
    const hi = Math.max.apply(null, lengths);
    const total = lengths.reduce((a, b) => a + b, 0);
    if (hi - lo <= tol) {
      return "  " + label + ": " + pairs.length + " members, " + fmt(lo, 4) + " each, total " + fmt(total, 3);
    }
    return (
      "  " + label + ": " + pairs.length + " members, " + fmt(lo, 4) + " to " + fmt(hi, 4) +
      ", total " + fmt(total, 3)
    );
  };

  const metrics = [
    "units: " + DOC.unitName + " (joints merge within " + fmtG(tol) + ")",
    "form generation: " + nSeg + "-gon, " + ringCount + " rings, " + nModules + " modules",
    "module length " + fmt(span, 4) + ", ring radius " + fmt(radius, 4) + ", mid scale " +
      fmt(scaleMid, 3) + " (radius " + fmt(radius * scaleMid, 4) + "), strut radius " + fmt(strutR, 4),
    "nodes: " + nodeCount,
    "members: " + memberCount,
  ];
  for (const spec of FAMILY_SPECS) metrics.push(groupLine(spec[1], spec[3]));
  metrics.push("total member length: " + fmt(totalLength, 3));
  metrics.push("struts: " + strutMembers.length + ", radius " + fmt(strutR, 4));
  metrics.push(
    "cables: " + cableMembers.length + " (" + flatRings.length + " ring + " +
    flatXcables.length + " X-cable), radius " + fmt(cableR, 4)
  );
  metrics.push("inner opening (clear radius about the module axis): " + fmt(innerOpening, 4));
  metrics.push(
    minClearance < 0.0
      ? "strut clearance: not applicable - fewer than two independent struts"
      : "strut clearance: " + fmt(minClearance, 4) + " closest approach, " + collisions +
        " pair(s) under " + fmt(2.0 * strutR, 4) + " (2 x strut radius)"
  );
  metrics.push(
    cableClear < 0.0
      ? "cable clearance: not applicable - no cable passes a strut it is not tied to"
      : "cable clearance: " + fmt(cableClear, 4) + " closest approach to a strut, " + cableHits +
        " cable crossing(s) under " + fmt(strutR + cableR, 4) + " (strut + cable radius)"
  );
  metrics.push("overall length along the module axis: " + fmt(overallLength, 3));
  metrics.push("extents y: " + fmt(extents[1][0], 3) + " to " + fmt(extents[1][1], 3));
  metrics.push("extents z: " + fmt(extents[2][0], 3) + " to " + fmt(extents[2][1], 3));

  return {
    nodes: nodes,
    strutMembers: strutMembers,
    secondaryCount: flatSecondaries.length,
    cableMembers: cableMembers,
    ringCount: flatRings.length,
    allMembers: allMembers,
    strutR: strutR,
    cableR: cableR,
    families: families,
    members: members,
    metrics: metrics,
    nodeCount: nodeCount,
    memberCount: memberCount,
    totalLength: totalLength,
    overallLength: overallLength,
    innerOpening: innerOpening,
    minClearance: minClearance,
    collisions: collisions,
    collidingStruts: collidingStruts,
    clashPoints: clashPoints,
    cableClearance: cableClear,
    cableHits: cableHits,
    cableClashPoints: cableClashPoints,
    extents: extents,
    flatRings: flatRings,
    flatXcables: flatXcables,
  };
}

// --- viewport geometry ------------------------------------------------------
// Each strut is a 24-sided tube closed by a disc at each end, one mesh per strut; each
// cable is a thin tube; each joint is a sphere the kit draws as a marker.
const TUBE_SIDES = 24;

// Colours ride the payload as theme tokens (theme.css defines them for both themes and
// the kit re-resolves them on a flip): the manuscript's two hues, compression teal and
// tension gold, split by job. A clash is marked where it happens - a sphere at the closest
// point of the two members - so the members keep their colours (the manuscript's own
// Collision message marks the area, not the member).
// Two colours in 3D, one per job: every strut compression teal, every cable tension gold.
// The four families separate on the DRAWINGS, by line style - a third and fourth hue on a
// shaded model reads as decoration, not as information (Hossein, 2026-09-15). The struts
// carry their own shade in 3D: a lit solid reads heavier than the same value as a line.
const MESH_TOKEN = { diag: "--halo-strut-mesh", sec: "--halo-strut-mesh" };
const CURVE_TOKEN = { ring: "--halo-cable", xcable: "--halo-cable" };
const CLASH_TOKEN = "--halo-clash";
const JOINT_TOKEN = "--halo-joint";
// Up to four struts and eight cables meet at a joint, and near it they overlap by their
// own thickness - out to about two strut radii for struts, three for a cable lying close
// along a strut. Drawn bare, that read as cables stabbing into struts. The manuscript's
// figures draw a node at every joint; so does this view, and the cables start at its
// surface, as they would at a real node.
const JOINT_SHARE = 1.6;

// A strut ends exactly at its joint, closed by a flat disc, so nothing shows through
// the section; the joint sphere covers the disc.
function strutMesh(a, b, r) {
  const positions = [];
  const indices = [];
  const ax = b[0] - a[0];
  const ay = b[1] - a[1];
  const az = b[2] - a[2];
  const len = Math.sqrt(ax * ax + ay * ay + az * az);
  const d = len > 0 ? [ax / len, ay / len, az / len] : [0, 0, 1];
  const helper = Math.abs(d[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let u = [
    helper[1] * d[2] - helper[2] * d[1],
    helper[2] * d[0] - helper[0] * d[2],
    helper[0] * d[1] - helper[1] * d[0],
  ];
  const ul = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]);
  u = [u[0] / ul, u[1] / ul, u[2] / ul];
  const v = [
    d[1] * u[2] - d[2] * u[1],
    d[2] * u[0] - d[0] * u[2],
    d[0] * u[1] - d[1] * u[0],
  ];

  const base = [];
  for (const t of [0, len]) {
    base.push(positions.length / 3);
    for (let s = 0; s <= TUBE_SIDES; s++) {
      const th = (2 * Math.PI * s) / TUBE_SIDES;
      const cs = Math.cos(th) * r;
      const sn = Math.sin(th) * r;
      positions.push(
        a[0] + d[0] * t + u[0] * cs + v[0] * sn,
        a[1] + d[1] * t + u[1] * cs + v[1] * sn,
        a[2] + d[2] * t + u[2] * cs + v[2] * sn
      );
    }
  }
  const p = base[0];
  const q = base[1];
  for (let s = 0; s < TUBE_SIDES; s++) {
    indices.push(p + s, q + s, p + s + 1, p + s + 1, q + s, q + s + 1);
  }
  // Each end closes on its own centre, so nothing shows through the section.
  const capA = positions.length / 3;
  positions.push(a[0], a[1], a[2]);
  const capB = positions.length / 3;
  positions.push(b[0], b[1], b[2]);
  for (let s = 0; s < TUBE_SIDES; s++) {
    indices.push(capA, p + s + 1, p + s);
    indices.push(capB, q + s, q + s + 1);
  }
  return { positions: positions, indices: indices };
}

export function geometry(c) {
  // strutMembers = secondaries then diagonals; cableMembers = ring cables then X-cables.
  const meshes = c.strutMembers.map((pr, i) => {
    const m = strutMesh(c.nodes.points[pr[0]], c.nodes.points[pr[1]], c.strutR);
    const family = i < c.secondaryCount ? "sec" : "diag";
    m.family = family;
    m.color = MESH_TOKEN[family];
    return m;
  });
  const jointR = c.strutR * JOINT_SHARE;
  const curves = c.cableMembers.map((pr, i) => {
    let a = c.nodes.points[pr[0]];
    let b = c.nodes.points[pr[1]];
    const len = Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
    // From joint surface to joint surface; a cable too short to leave its joints keeps
    // its full length (it is hidden inside them either way).
    if (len > 2 * jointR) {
      const k = jointR / len;
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      a = [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
      b = [b[0] - d[0] * k, b[1] - d[1] * k, b[2] - d[2] * k];
    }
    const family = i < c.ringCount ? "ring" : "xcable";
    return { points: [a[0], a[1], a[2], b[0], b[1], b[2]], family: family, color: CURVE_TOKEN[family], radius: c.cableR };
  });
  const used = new Set();
  for (const pr of c.allMembers) { used.add(pr[0]); used.add(pr[1]); }
  const markers = [];
  for (const i of used) markers.push({ at: c.nodes.points[i], radius: jointR, color: JOINT_TOKEN });
  // Big enough to find on a rope of many members, still tied to the members it marks.
  // A touch larger than a joint, so a clash beside a joint still shows, and no larger:
  // on a slim rope bigger spheres filled the walkway.
  for (const p of c.clashPoints.concat(c.cableClashPoints)) {
    markers.push({ at: p, radius: c.strutR * 1.8, color: CLASH_TOKEN });
  }
  let lo = [Infinity, Infinity, Infinity];
  let hi = [-Infinity, -Infinity, -Infinity];
  const eat = (x, y, z) => {
    if (x < lo[0]) lo[0] = x;
    if (y < lo[1]) lo[1] = y;
    if (z < lo[2]) lo[2] = z;
    if (x > hi[0]) hi[0] = x;
    if (y > hi[1]) hi[1] = y;
    if (z > hi[2]) hi[2] = z;
  };
  for (const m of meshes) {
    for (let i = 0; i < m.positions.length; i += 3) eat(m.positions[i], m.positions[i + 1], m.positions[i + 2]);
  }
  for (const cu of curves) {
    for (let i = 0; i < cu.points.length; i += 3) eat(cu.points[i], cu.points[i + 1], cu.points[i + 2]);
  }
  // The joints are part of the drawn rope, so the extents (the ground grid's seat, the
  // walkthrough's ends) include them.
  for (const i of used) {
    const p = c.nodes.points[i];
    eat(p[0] - jointR, p[1] - jointR, p[2] - jointR);
    eat(p[0] + jointR, p[1] + jointR, p[2] + jointR);
  }
  const count = meshes.length + curves.length;
  return {
    label: "assembly",
    meshes: meshes,
    curves: curves,
    markers: markers,
    points: [],
    bounds: [lo[0], lo[1], lo[2], hi[0], hi[1], hi[2]],
    itemCount: count,
    renderedCount: count,
    vertexCount: meshes.reduce((s, m) => s + m.positions.length / 3, 0),
    warnings: [],
  };
}

// --- the shape the kit consumes ---------------------------------------------

function textView(param, rows, access) {
  return {
    param: param,
    access: access || "list",
    tree: { pathCount: 1, dataCount: rows.length, isFlat: true },
    types: [{ typeName: "Text", clr: "System.String", count: rows.length, goo: "GH_String" }],
    samples: rows.map((value, index) => ({
      path: "{0;0}",
      index: index,
      type: "Text",
      typeName: "Text",
      value: String(value),
      valueLength: String(value).length,
    })),
    warnings: null,
    samplesTruncated: false,
  };
}

function scalarView(param, value, typeName) {
  return {
    param: param,
    access: "item",
    tree: { pathCount: 1, dataCount: 1, isFlat: true },
    types: [{ typeName: typeName, clr: "", count: 1, goo: "" }],
    samples: [
      { path: "{0;0}", index: 0, type: typeName, typeName: typeName, value: String(value), valueLength: String(value).length },
    ],
    warnings: null,
    samplesTruncated: false,
  };
}

export function solve(values) {
  const c = core(values);
  const geo = geometry(c);

  const assemblySamples = [];
  for (let i = 0; i < c.strutMembers.length; i++) assemblySamples.push("Untrimmed Surface");
  for (let i = 0; i < c.cableMembers.length; i++) assemblySamples.push("Line-like Curve");

  const views = {
    assembly: {
      param: "assembly",
      access: "list",
      tree: { pathCount: 1, dataCount: assemblySamples.length, isFlat: true },
      types: [
        { typeName: "Surface", clr: "Rhino.Geometry.Brep", count: c.strutMembers.length, goo: "GH_Surface" },
        { typeName: "Curve", clr: "Rhino.Geometry.LineCurve", count: c.cableMembers.length, goo: "GH_Curve" },
      ],
      samples: assemblySamples.map((value, index) => ({
        path: "{0;0}", index: index, type: "Surface", typeName: index < c.strutMembers.length ? "Surface" : "Curve",
        value: value, valueLength: value.length,
      })),
      warnings: null,
      samplesTruncated: true,
    },
    members: textView("members", c.members),
    families: textView("families", c.families),
    metrics: textView("metrics", c.metrics),
    node_count: scalarView("node_count", c.nodeCount, "Integer"),
    member_count: scalarView("member_count", c.memberCount, "Integer"),
    total_length: scalarView("total_length", c.totalLength, "Number"),
    overall_length: scalarView("overall_length", c.overallLength, "Number"),
    inner_opening: scalarView("inner_opening", c.innerOpening, "Number"),
    min_clearance: scalarView("min_clearance", c.minClearance, "Number"),
    collisions: scalarView("collisions", c.collisions, "Integer"),
    cable_clearance: scalarView("cable_clearance", c.cableClearance, "Number"),
    cable_hits: scalarView("cable_hits", c.cableHits, "Integer"),
  };

  return { views: views, geometry: { assembly: geo } };
}
