// SPDX-License-Identifier: Apache-2.0
import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver; the wire layers observe their container for reflow.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  ;(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
    ResizeObserverStub
}

// jsdom has no matchMedia; mock a desktop-like environment (wide, fine pointer that hovers)
// so size/input-gated UI renders its full interactive variant in tests.
if (typeof window !== 'undefined') {
  window.matchMedia = (query: string) =>
    ({
      matches: /min-width|hover: hover|pointer: fine/.test(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom does not implement pointer capture; the draggable patch uses it.
if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.hasPointerCapture = () => false
}
