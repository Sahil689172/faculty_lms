import { useRef, type DependencyList } from "react";

/**
 * Animation hooks intentionally no-op for a static UI.
 * Kept so existing call sites continue to work without a GSAP dependency.
 */

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
