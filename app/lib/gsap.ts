import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

/**
 * GSAP re-export for use across the app.
 *
 * IMPORTANT: Do NOT call gsap.registerPlugin() or gsap.defaults() at module
 * scope here — Cloudflare Workers (Oxygen) disallows certain operations in
 * global scope during SSR bundle evaluation.
 *
 * Instead, register plugins and set defaults inside a client-only init module
 * that is imported only from client-side code (components/hooks that run in
 * the browser).
 */

/**
 * Call this once from a client-only entry point to initialize GSAP plugins
 * and project-wide defaults. Safe to call multiple times (idempotent).
 */
let _initialized = false
export function initGSAP() {
  if (_initialized) return
  _initialized = true
  gsap.registerPlugin(useGSAP)
  gsap.defaults({
    duration: 0.6,
    ease: 'power2.out',
  })
}

export { gsap, useGSAP }
