// Standalone data layer for the HALO app.
//
// Implements exactly the surface the shipped kit's mount() and bind.* use, and nothing
// more, so kit/ can be copied verbatim and index.html changes only its import and its
// one connect() call. Where the live app talks to Wireify over HTTP, this solves the
// definition in the browser instead (see solve.js).
//
// The kit surface, from kit/KIT.md:
//   homeId, state, onState(fn), onStatus(fn), control(id), editing(id, active),
//   isEditing(id), gesture(id, kind), push(id, value, opts), close()

import { SNAPSHOT } from "./snapshot.js";
import { solve } from "./solve.js";
import { create } from "./kit/ify-viewport.js";

const clone = (o) => JSON.parse(JSON.stringify(o));

function clampToControl(control, value) {
  let v = Number(value);
  if (!isFinite(v)) return { value: control.value, clamped: true };
  let clamped = false;
  if (control.min !== null && v < control.min) { v = control.min; clamped = true; }
  if (control.max !== null && v > control.max) { v = control.max; clamped = true; }
  if (control.step) {
    const snapped = Math.round((v - control.min) / control.step) * control.step + control.min;
    // guard float drift from the multiply/divide
    const dec = control.decimals == null ? 6 : Math.min(control.decimals, 6);
    v = Number(snapped.toFixed(dec));
    if (control.min !== null && v < control.min) v = control.min;
    if (control.max !== null && v > control.max) v = control.max;
  }
  return { value: v, clamped };
}

export function local(opts = {}) {
  const homeId = opts.homeId || "halo-standalone";
  const controls = clone(SNAPSHOT.controls);
  // The live server fills label/help from app/manifest.json after the bridge reads; here
  // the page hands the manifest's text over once it has fetched it (setControlText).
  for (const c of controls) { c.label = null; c.help = null; }
  const byId = new Map(controls.map((c) => [c.id, c]));
  const byName = new Map(controls.map((c) => [c.nickName, c]));

  const stateListeners = new Set();
  const statusListeners = new Set();
  const editing = new Set();

  let state = null;
  let geometry = null;
  let status = { kind: "live", text: "solved in your browser" };

  function values() {
    const out = {};
    for (const c of controls) out[c.nickName] = c.value;
    // the component's input names differ from the slider nicknames for three of six
    return {
      segments: out.tensegrity_segments,
      module_radius: out.tensegrity_module_radius,
      module_length: out.tensegrity_module_length,
      module_count: out.module_count,
      mid_scale: out.mid_scale,
      strut_radius: out.strut_radius,
    };
  }

  function recompute() {
    const result = solve(values());
    geometry = result.geometry;
    const views = SNAPSHOT.viewOrder.map((v) => {
      const solved = result.views[v.param];
      return Object.assign({}, solved, { id: v.id, label: v.label });
    });
    state = {
      wireify: "standalone",
      docName: SNAPSHOT.docName,
      // The Grasshopper document is set to millimetres, but the definition was drawn in
      // metres (a 20 m rope of 5 m modules, struts of 0.19 m; the manuscript's scale), so
      // the page labels everything in metres. The captured value stays in snapshot.js.
      docUnits: "Meters",
      tolerance: SNAPSHOT.tolerance,
      isActiveCanvas: true,
      warnings: null,
      controls: clone(controls),
      views,
    };
    return state;
  }

  function setStatus(next) {
    status = next;
    for (const fn of statusListeners) {
      try { fn(status); } catch (e) { console.error("halo: a status listener failed: " + (e && e.message), e); }
    }
  }

  function emit() {
    recompute();
    for (const fn of stateListeners) {
      try { fn(state); } catch (e) { console.error("halo: a state listener failed: " + (e && e.message), e); }
    }
  }

  recompute();

  const app = {
    homeId,
    get state() { return state; },

    onState(fn) {
      stateListeners.add(fn);
      try { fn(state); } catch (e) { console.error("halo: a state listener failed: " + (e && e.message), e); }
      return () => stateListeners.delete(fn);
    },

    onStatus(fn) {
      statusListeners.add(fn);
      try { fn(status); } catch (e) { console.error("halo: a status listener failed: " + (e && e.message), e); }
      return () => statusListeners.delete(fn);
    },

    control(id) {
      const c = byId.get(id) || byName.get(id);
      return c ? clone(c) : null;
    },

    editing(id, active) {
      if (active) editing.add(id); else editing.delete(id);
    },
    isEditing(id) { return editing.has(id); },
    // The viewport asks this before it re-frames: no camera move under a held control.
    editingAny() { return editing.size > 0; },

    // Undo lives in Grasshopper; there is no canvas here, so brackets are inert by
    // design rather than unimplemented.
    gesture() {},

    push(id, value) {
      const c = byId.get(id) || byName.get(id);
      if (!c) return Promise.resolve({ ok: false, status: 404, control: null });
      const { value: v, clamped } = clampToControl(c, value);
      const previous = c.value;
      c.value = v;
      try {
        emit();
      } catch (e) {
        // The component refuses some values outright - a ring of radius zero is no rope.
        // Grasshopper would raise there; here the page must not keep showing the numbers
        // of the rope it no longer has. Put the control back, re-solve what was good, and
        // mark the row that was refused (the kit reads `id` on the status).
        c.value = previous;
        emit();
        setStatus({ kind: "error", id: c.id, text: "the definition refuses " + (c.label || c.nickName) + " = " + v });
        return Promise.resolve({ ok: false, status: 422, clamped, control: clone(c) });
      }
      if (status.kind !== "live") setStatus({ kind: "live", text: "solved in your browser" });
      return Promise.resolve({ ok: true, status: 200, clamped, control: clone(c) });
    },

    close() {
      stateListeners.clear();
      statusListeners.clear();
    },

    // What the live server does with a manifest's label/help: attach them to the controls
    // and re-emit, so the kit renders the human names. `text` maps control id -> {label, help}.
    setControlText(text) {
      for (const c of controls) {
        const t = text && text[c.id];
        c.label = t && t.label ? String(t.label) : null;
        c.help = t && t.help ? String(t.help) : null;
      }
      emit();
    },

    // not part of the kit contract - the page's viewport binder reads it
    get geometry() { return geometry; },
  };

  return app;
}

// Local stand-in for kit/ify-viewport.js's bind(), which fetches api/geometry over
// HTTP. Same call signature and same returned shape, but the payload comes from the
// in-browser solve. KIT.md's note applies: create() once, then update() + autoFit()
// from an onState subscription.
export function bindViewport(app, viewId, el, opts = {}) {
  const vp = create(el, Object.assign(
    { holding: () => !!(app.editingAny && app.editingAny()) }, opts));
  const statusEl = opts.statusEl || null;
  const param = opts.param || "assembly";
  let fitted = false;

  function render() {
    const payload = app.geometry && app.geometry[param];
    if (!payload) return;
    vp.update(payload);
    if (!fitted && payload.bounds) { vp.autoFit(); fitted = true; }
    if (statusEl) {
      const parts = [`${payload.itemCount} members`];
      for (const w of payload.warnings || []) parts.push(w);
      statusEl.textContent = parts.join(" · ");
    }
  }

  const unsub = app.onState(render);
  render();

  return {
    viewport: vp,
    refresh: render,
    dispose() { unsub(); vp.dispose(); },
  };
}
