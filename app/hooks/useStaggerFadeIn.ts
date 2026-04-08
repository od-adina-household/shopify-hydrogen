import { useRef } from "react";
import { gsap, useGSAP } from "~/lib/gsap";

interface UseStaggerFadeInOptions {
  /** CSS selector for child elements to animate. Default: "> *" */
  selector?: string;
  /** Stagger amount in seconds. Default: 0.08 */
  stagger?: number;
  /** Animation duration in seconds. Default: 0.6 */
  duration?: number;
  /** Starting Y offset. Default: 24 */
  startY?: number;
  /** Starting opacity. Default: 0 */
  startOpacity?: number;
  /** Delay before animation starts. Default: 0 */
  delay?: number;
}

/**
 * Staggered fade-in animation for child elements.
 * Useful for card grids, list items, etc.
 * Respects prefers-reduced-motion.
 */
export function useStaggerFadeIn(
  scope: React.RefObject<HTMLElement | null>,
  options: UseStaggerFadeInOptions = {}
) {
  const {
    selector = "> *",
    stagger = 0.08,
    duration = 0.6,
    startY = 24,
    startOpacity = 0,
    delay = 0,
  } = options;

  const mmRef = useRef<gsap.Context | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions!;

          gsap.fromTo(
            selector,
            {
              y: reduceMotion ? 0 : startY,
              opacity: reduceMotion ? 1 : startOpacity,
            },
            {
              y: 0,
              opacity: 1,
              duration: reduceMotion ? 0 : duration,
              ease: "power2.out",
              stagger: reduceMotion ? 0 : stagger,
              delay,
            }
          );
        }
      );

      mmRef.current = mm as unknown as gsap.Context;
    },
    { scope: scope.current ?? undefined }
  );
}
