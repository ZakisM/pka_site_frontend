const reducedMotion = () => globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth, unless the viewer has asked their system for less motion. */
export const smoothScroll = (): ScrollBehavior => (reducedMotion() ? "instant" : "smooth");

/** A short fade-in for content that swaps in place without remounting. */
export const fadeIn = (element: HTMLElement | null) => {
  if (element && !reducedMotion()) {
    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "ease-out" });
  }
};
