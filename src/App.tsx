import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { gsap, prefersReducedMotion, sceneState, ScrollTrigger, startSmoothScroll } from './lib/motion';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Stats from './components/Stats';

const Scene = lazy(() => import('./three/Scene'));

type Keyframe = Partial<typeof sceneState>;

/** Where the 3D blob sits while each section is on screen. */
const keyframes: Record<string, Keyframe> = {
  hero: { x: 1.75, y: 0, z: 0, scale: 0.85, distort: 0.38, spin: 0, corner: 0 },
  // After the hero it parks in the top-right corner so it never sits behind text.
  about: { distort: 0.55, spin: 0.8, corner: 1 },
  projects: { distort: 0.3, spin: 1.6, corner: 1 },
  skills: { distort: 0.7, spin: 2.2, corner: 1 },
  contact: { distort: 0.6, spin: 3, corner: 1 },
};

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [webgl] = useState(supportsWebGL);
  const onDone = useCallback(() => setReady(true), []);

  useEffect(() => {
    startSmoothScroll();
    Object.assign(sceneState, keyframes.hero);
    const move = (e: PointerEvent) => {
      sceneState.pointerX = e.clientX / window.innerWidth - 0.5;
      sceneState.pointerY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  // Children's pins are created first (effects run child → parent), so these
  // triggers measure the final, pin-spaced layout.
  useLayoutEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>('[data-scene]');
    const triggers = sections.slice(1).map((section, i) => {
      const from = keyframes[sections[i].dataset.scene!];
      const to = keyframes[section.dataset.scene!];
      return gsap.fromTo(sceneState, { ...from }, {
        ...to,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: section, start: 'top bottom', end: prefersReducedMotion ? 'top bottom+=1' : 'top 30%', scrub: true },
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      triggers.forEach((t) => t.scrollTrigger?.kill());
      triggers.forEach((t) => t.kill());
      window.removeEventListener('load', refresh);
    };
  }, []);

  // Thin scroll progress bar at the top of the viewport.
  useLayoutEffect(() => {
    const t = gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, []);

  return (
    <>
      {webgl ? (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      ) : (
        <div
          className="fixed inset-0 -z-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(30% 30% at 72% 30%, rgb(10 10 10 / .08), transparent 70%)' }}
        />
      )}
      <div className="scroll-progress fixed inset-x-0 top-0 z-[55] h-[2px] origin-left scale-x-0 bg-accent" />
      <div className="grain" aria-hidden="true" />
      {!ready && <Preloader onDone={onDone} />}
      <Cursor />
      <Nav />
      <main className="relative z-10">
        <Hero ready={ready} />
        <Stats />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
