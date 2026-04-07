import { useRef } from "react";
import { cn } from "~/lib/utils";
import { useScrollReveal } from "~/hooks/useScrollReveal";

type AnimationVariant = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-in";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  /** Animation variant */
  variant?: AnimationVariant;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Distance for slide/scale animations */
  distance?: number;
  /** ScrollTrigger offset from element top */
  triggerOffset?: number;
  /** Whether to animate only once */
  once?: boolean;
  /** Additional className */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Drop-in wrapper component for scroll-triggered animations.
 * Wraps children and animates them when they enter the viewport.
 * Respects prefers-reduced-motion.
 */
export function AnimateOnScroll({
  children,
  variant = "fade-up",
  duration = 0.7,
  delay = 0,
  distance = 40,
  triggerOffset = 100,
  once = true,
  className,
  as: Component = "div",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useScrollReveal(ref as React.RefObject<HTMLElement | null>, {
    variant,
    duration,
    distance,
    triggerOffset,
    once,
    delay,
  });

  return (
    <Component ref={ref} className={cn(className)}>
      {children}
    </Component>
  );
}
