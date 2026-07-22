import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "../lib/useGsap";

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: EASE, clearProps: "transform" },
      );
    }, el);
    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={ref} className="min-h-full">
      {children}
    </div>
  );
}
