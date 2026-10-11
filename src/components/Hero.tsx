import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, scrollToTarget } from '../lib/motion';
import { profile } from '../data';
import Split from './Split';
import Magnetic from './Magnetic';

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.hero-name .char', { yPercent: 110 });
      gsap.set('.hero-fade', { autoAlpha: 0, y: 20 });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const d = prefersReducedMotion ? 0 : 1;
      gsap.to('.hero-name .char', { yPercent: 0, duration: 1.2 * d, ease: 'expo.out', stagger: 0.04 * d });
      gsap.to('.hero-fade', { autoAlpha: 1, y: 0, duration: 1 * d, ease: 'power3.out', stagger: 0.08 * d, delay: 0.5 * d });
      if (!prefersReducedMotion) {
        gsap.to('.hero-inner', {
          yPercent: -18,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="top" ref={root} data-scene="hero" className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-8 md:px-10 md:pb-10">
      <div className="hero-inner">
        <p className="hero-fade eyebrow mb-6 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Available for new projects
        </p>
        <h1 className="hero-name font-medium uppercase leading-[0.82] tracking-[-0.05em] mix-blend-difference">
          <span className="line-mask text-[17.5vw] md:text-[15.5vw]">
            <Split text="Prajwal" />
          </span>
          <span className="line-mask flex items-end justify-between text-[17.5vw] md:text-[15.5vw]">
            <Split text="D L" />
            <span className="hero-fade serif mb-[0.12em] hidden max-w-[22ch] text-right text-2xl normal-case leading-tight tracking-normal md:block lg:text-4xl">
              Full stack developer &amp; <em className="text-accent">debugging</em> specialist
            </span>
          </span>
        </h1>
        <div className="mt-8 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="hero-fade serif text-2xl leading-tight md:hidden">
            Full stack developer &amp; <em className="text-accent">debugging</em> specialist
          </p>
          <p className="hero-fade max-w-md text-sm text-muted">
            Based in {profile.location}. Building React, Next.js, Supabase and PHP products — interfaces people enjoy and
            backends that hold up.
          </p>
          <div className="hero-fade flex gap-3">
            <Magnetic>
              <a
                href={profile.resume}
                download="Prajwal-DL-Resume.pdf"
                className="inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent"
              >
                Download résumé
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget('#contact');
                }}
                className="inline-flex rounded-full border border-line px-6 py-3 text-sm transition-colors hover:border-ink"
              >
                Let’s talk
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
