import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, scrollToTarget } from '../lib/motion';
import { profile } from '../data';
import Split from './Split';
import Magnetic from './Magnetic';

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.hero-title .word', { yPercent: 110 });
      gsap.set('.hero-fade', { autoAlpha: 0, y: 20 });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const d = prefersReducedMotion ? 0 : 1;
      gsap.to('.hero-title .word', { yPercent: 0, duration: 1.1 * d, ease: 'expo.out', stagger: 0.06 * d });
      gsap.to('.hero-fade', { autoAlpha: 1, y: 0, duration: 0.9 * d, ease: 'power3.out', stagger: 0.08 * d, delay: 0.4 * d });
      if (!prefersReducedMotion) {
        gsap.to('.hero-inner', {
          yPercent: -12,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="top" ref={root} data-scene="hero" className="relative mx-auto flex min-h-[78svh] max-w-[1280px] items-center px-5 pt-28 pb-14 md:px-10">
      <div className="hero-inner max-w-3xl">
        <p className="hero-fade eyebrow mb-6 flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
          </span>
          Available for new projects · {profile.location}
        </p>
        <h1 className="hero-title text-[13vw] font-semibold leading-[0.92] tracking-[-0.05em] md:text-[clamp(56px,7.5vw,112px)]">
          <span className="line-mask">
            <Split text="Full stack developer & debugging specialist." by="word" />
          </span>
        </h1>
        <p className="hero-fade mt-6 max-w-xl text-lg leading-relaxed text-muted">
          I build React, Next.js, Supabase and PHP products end to end — interfaces people enjoy and backends that hold up
          in production.
        </p>
        <div className="hero-fade mt-8 flex flex-wrap gap-3">
          <Magnetic>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#projects');
              }}
              className="inline-flex rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-bg"
            >
              See my work
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#contact');
              }}
              className="inline-flex rounded-full border border-ink px-6 py-3.5 text-[15px] font-medium"
            >
              Let’s talk
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
