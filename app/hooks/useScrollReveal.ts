import { useRef } from "react";
import { gsap, useGSAP } from "~/lib/gsap";

interface UseScrollRevealOptions {
  /** CSS selector for elements to animate. Default: "> *" */
  selector?: string;
  /** Animation variant. Default: "fade-up" */
  variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-in";
  /** Animation duration in seconds. Default: 0.7 */
  duration?: number;
  /** Distance for slide/scale animations. Default: 40 */
  distance?: number;
  /** Starting opacity. Default: 0 */
  startOpacity?: number;
  /** ScrollTrigger offset from element top. Default: 100 */
  triggerOffset?: number;
  /** Whether to animate only once. Default: true */
  once?: boolean;
  /** Delay before animation. Default: 0 */
  delay?: number;
}

/**
 * Scroll-triggered reveal animation using ScrollTrigger.
 * Elements animate when they enter the viewport.
 * Respects prefers-reduced-motion.
 */
export function useScrollReveal(
  scope: { current: HTMLElement | null },
  options: UseScrollRevealOptions = {}
) {
  const {
    selector = "> *",
    variant = "fade-up",
    duration = 0.7,
    distance = 40,
    startOpacity = 0,
    triggerOffset = 100,
    once = true,
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

          // Build from-vars based on variant
          const fromVars: Record<string, unknown> = {
            opacity: reduceMotion ? 1 : startOpacity,
          };

          if (!reduceMotion) {
            switch (variant) {
              case "fade-up":
                fromVars.y = distance;
                break;
              case "slide-left":
                fromVars.x = -distance;
                break;
              case "slide-right":
                fromVars.x = distance;
                break;
              case "scale-in":
                fromVars.scale = 0.95;
                break;
              case "fade-in":
              default:
                break;
            }
          }

          gsap.fromTo(
            selector,
            fromVars,
            {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              duration: reduceMotion ? 0 : duration,
              ease: "power2.out",
              delay,
              scrollTrigger: {
                trigger: scope.current,
                start: `top+=${triggerOffset} bottom`,
                toggleActions: "play none none none",
                once,
              },
            }
          );
        }
      );

      mmRef.current = mm as unknown as gsap.Context;
    },
    { scope: scope.current ?? undefined }
  );
}
