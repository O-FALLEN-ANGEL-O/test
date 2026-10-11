import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (prefersReducedMotion || lenis) return;
  lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4 });
    return;
  }
  if (typeof target === 'number') window.scrollTo({ top: target });
  else document.querySelector(target)?.scrollIntoView();
}

export function lockScroll(locked: boolean) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/**
 * Shared, mutable state the WebGL scene reads every frame. Scroll timelines
 * tween these values; the scene eases its meshes toward them.
 */
export const sceneState = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  distort: 0.38,
  spin: 0,
  accent: 0.35,
  pointerX: 0,
  pointerY: 0,
};

export { gsap, ScrollTrigger };
