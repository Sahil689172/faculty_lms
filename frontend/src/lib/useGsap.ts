import { useLayoutEffect, useRef, type DependencyList } from "react";
import gsap from "gsap";

export const EASE = "power2.out";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scopes a GSAP setup function to a container element and automatically
 * reverts (cleans up) every tween/timeline on unmount or dependency change.
 * Skips all animation when the user prefers reduced motion.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (self: T) => void,
  deps: DependencyList = [],
) {
  const scope = useRef<T>(null);

  useLayoutEffect(() => {
    const el = scope.current;
    if (!el || prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => setup(el), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}

/**
 * Staggered entrance for any descendant marked with `data-reveal`.
 * Runs once per mount. Used for cards, lists and dashboards.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  deps: DependencyList = [],
) {
  return useGsap<T>(() => {
    gsap.from("[data-reveal]", {
      y: 18,
      opacity: 0,
      duration: 0.55,
      ease: EASE,
      stagger: 0.06,
      clearProps: "transform,opacity",
    });
  }, deps);
}
