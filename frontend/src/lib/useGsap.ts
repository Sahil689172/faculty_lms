import { useRef, type DependencyList } from "react";

// Animations were intentionally removed for a clean, static UI.
// These hooks are kept as no-ops so existing callers keep working.

export const EASE = "power2.out";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useGsap<T extends HTMLElement = HTMLDivElement>(
  _setup?: (self: T) => void,
  _deps: DependencyList = [],
) {
  return useRef<T>(null);
}

export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  _deps: DependencyList = [],
) {
  return useRef<T>(null);
}
