import { useRef } from 'react'
import { useLocation } from 'react-router'
import { gsap, useGSAP } from '~/lib/gsap'

interface UsePageTransitionOptions {
  /** CSS selector for the element to animate. Default: "> *" */
  selector?: string
  /** Animation duration in seconds. Default: 0.4 */
  duration?: number
  /** Starting Y offset for slide-up effect. Default: 16 */
  startY?: number
  /** Starting opacity. Default: 0 */
  startOpacity?: number
}

/**
 * Page transition animation — fades in and slides up content on route change.
 * Uses useLocation as the dependency trigger.
 * Respects prefers-reduced-motion.
 */
export function usePageTransition(
  scope: React.RefObject<HTMLElement | null>,
  options: UsePageTransitionOptions = {}
) {
  const { selector = '> *', duration = 0.4, startY = 16, startOpacity = 0 } = options

  const location = useLocation()
  const mmRef = useRef<gsap.Context | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        context => {
          const { reduceMotion } = context.conditions!

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
              ease: 'power2.out',
              stagger: 0.05,
            }
          )
        }
      )

      mmRef.current = mm as unknown as gsap.Context
    },
    { scope: scope.current ?? undefined, dependencies: [location.pathname] }
  )
}
